// Using fetch API instead of OpenAI SDK to avoid dependency issues
import { getSession } from "auth/server";
import { deductUserCredits } from "@/lib/db/repository";
import { pgUserCreditsRepository } from "@/lib/db/pg/repositories/user-repository.pg";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Get user credits before processing
    const userCredit = await pgUserCreditsRepository.getUserCredits(userId);
    if (!userCredit || userCredit.credits <= 0) {
      return new Response(
        JSON.stringify({
          error:
            "Insufficient credits. Please upgrade your plan or contact support.",
          needsUpgrade: true,
        }),
        {
          status: 402,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response("No audio file provided", { status: 400 });
    }

    // Validate file size (max 25MB as per OpenAI limits)
    if (audioFile.size > 25 * 1024 * 1024) {
      return new Response("Audio file too large (max 25MB)", { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/webm",
      "audio/m4a",
    ];
    if (
      !validTypes.includes(audioFile.type) &&
      !audioFile.name.match(/\.(mp3|mp4|wav|webm|m4a)$/i)
    ) {
      return new Response("Invalid audio file type", { status: 400 });
    }

    try {
      // Create FormData for OpenAI API
      const openaiFormData = new FormData();
      openaiFormData.append("file", audioFile);
      openaiFormData.append("model", "whisper-1");
      openaiFormData.append("response_format", "json");

      // Call OpenAI Whisper API directly
      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: openaiFormData,
        },
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("OpenAI API error:", error);
        throw new Error(`OpenAI API failed: ${response.status}`);
      }

      const transcription = await response.json();

      // Deduct credits for transcription (equivalent to ~100 tokens per minute of audio)
      const estimatedTokens = Math.ceil(audioFile.size / (1024 * 10)); // Rough estimation
      const deductedCredits = await deductUserCredits(userId, estimatedTokens);

      console.log(
        `Transcription completed for user ${userId}: ${deductedCredits} credits deducted`,
      );

      return new Response(
        JSON.stringify({
          transcript: transcription.text,
          deductedCredits,
          remainingCredits: userCredit.credits - deductedCredits,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("OpenAI transcription error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to transcribe audio. Please try again.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  } catch (error) {
    console.error("Transcription API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
