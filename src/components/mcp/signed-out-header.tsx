"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { SignInModal } from "./sign-in-modal";

export function SignedOutHeader() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const handleGetStarted = () => {
    setIsSignInModalOpen(true);
  };

  return (
    <header className="flex items-center w-full px-4 py-3 bg-background gap-4">
      <Link href="/" className="flex items-center">
        <span className="text-xl font-bold text-foreground">David AI</span>
      </Link>

      <div className="flex items-center gap-3 ml-auto">
        <Button onClick={handleGetStarted} variant="default">
          Get started
        </Button>
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </header>
  );
}
