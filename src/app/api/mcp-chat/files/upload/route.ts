import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "auth/server";
import { db } from "@/lib/db/pg/db.pg";
import { userCredits } from "@/lib/db/pg/schema.pg";
import { eq } from "drizzle-orm";
import { deductUserCredits } from "@/lib/db/repository";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

const UPLOAD_CREDIT_COST = 10; // 10 crédits par fichier uploadé

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Vérifier si l'utilisateur a assez de crédits
  const [userCredit] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, session.user.id));

  if (!userCredit || userCredit.credits < UPLOAD_CREDIT_COST) {
    return NextResponse.json(
      {
        error: `Insufficient credits. File upload requires ${UPLOAD_CREDIT_COST} credits. You have ${userCredit?.credits || 0} credits remaining.`,
        remainingCredits: userCredit?.credits || 0,
      },
      { status: 402 },
    );
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get("file") as File).name;
    const fileBuffer = await file.arrayBuffer();

    try {
      // Convert file to base64 data URL for storage
      const base64 = Buffer.from(fileBuffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Déduire les crédits après upload réussi
      // Note: deductUserCredits calcule 1 crédit = 1000 tokens, donc on multiplie par 1000
      try {
        await deductUserCredits(session.user.id, UPLOAD_CREDIT_COST * 1000);
      } catch (creditError) {
        console.error("Error deducting credits for file upload:", creditError);
        return NextResponse.json(
          { error: "Failed to process credits" },
          { status: 500 },
        );
      }

      // Récupérer les crédits restants
      const [updatedUserCredit] = await db
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, session.user.id));

      return NextResponse.json({
        url: dataUrl,
        pathname: filename,
        contentType: file.type,
        creditsDeducted: UPLOAD_CREDIT_COST,
        remainingCredits: updatedUserCredit?.credits || 0,
      });
    } catch (error) {
      console.error("File processing failed:", error);
      return NextResponse.json(
        { error: "File processing failed" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Failed to process request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
