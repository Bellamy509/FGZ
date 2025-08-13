"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        console.error("Too many requests. Please try again later.");
        return;
      }
      console.error("Auth error:", e.error);
    },
  },
});
