import { auth } from "auth/server";
import { toNextJsHandler } from "better-auth/next-js";
import { onUserCreated } from "@/app/api/auth/actions";
import { NextRequest, NextResponse } from "next/server";

const baseHandler = toNextJsHandler(auth.handler);

// Wrapper to handle post-signup logic
async function handleRequest(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Check if this is a signup request
  const isSignup = pathname.includes("/sign-up/email") && req.method === "POST";

  if (isSignup) {
    // First, let the auth handler process the signup
    const response = await baseHandler.POST(req);

    // If signup was successful, grant credits
    if (response.status === 200) {
      try {
        const responseData = await response.clone().json();
        if (responseData?.user?.id) {
          await onUserCreated(responseData.user.id);
          console.log(
            `✅ Free credits granted to user: ${responseData.user.id}`,
          );
        }
      } catch (error) {
        console.error(`❌ Failed to grant free credits:`, error);
        // Don't fail the signup if credits fail, just log it
      }
    }

    return response;
  }

  // For all other requests, use the base handler
  if (req.method === "GET") {
    return baseHandler.GET(req);
  } else if (req.method === "POST") {
    return baseHandler.POST(req);
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const GET = handleRequest;
export const POST = handleRequest;
