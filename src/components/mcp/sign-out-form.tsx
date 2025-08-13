"use client";

import { authClient } from "@/lib/auth/client";

export const SignOutForm = () => {
  const handleSignOut = () => {
    authClient.signOut().finally(() => {
      window.location.href = "/";
    });
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full text-left px-1 py-0.5 text-red-500"
    >
      Sign out
    </button>
  );
};
