import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import {
  ensureUserHasCredits,
  initializeAllUserCredits,
} from "@/app/api/auth/actions";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await ensureUserHasCredits(session.user.id);

    return NextResponse.json({
      success: result.success,
      credits: result.credits,
      wasCredited: result.credited,
      error: result.error,
    });
  } catch (error) {
    console.error("Error checking user credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admin users to initialize all credits
    // For now, we'll check if the user email is in environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const isAdmin = adminEmails.includes(session.user.email || "");

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const results = await initializeAllUserCredits();

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error initializing all user credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
