"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Loader, Mail } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

type VerificationStatus = "loading" | "success" | "error" | "expired";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState<string>("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token missing");
        return;
      }

      try {
        // Appeler l'API de vérification
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "GET",
        });

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");

          // Rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            router.push("/sign-in");
          }, 3000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setStatus("error");
          setMessage(errorData.message || "Error during verification");
        }
      } catch (_error) {
        setStatus("error");
        setMessage("Connection error");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader className="h-10 w-10 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle className="h-10 w-10 text-green-600" />;
      case "error":
      case "expired":
        return <XCircle className="h-10 w-10 text-red-600" />;
      default:
        return <Mail className="h-10 w-10 text-blue-600" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "loading":
        return "Verification in progress...";
      case "success":
        return "Email verified!";
      case "error":
        return "Verification error";
      case "expired":
        return "Link expired";
      default:
        return "Email verification";
    }
  };

  const getDescription = () => {
    switch (status) {
      case "loading":
        return "We are verifying your email address...";
      case "success":
        return "Your account is now active. You will be redirected to the login page.";
      case "error":
        return "An error occurred during the verification of your email.";
      case "expired":
        return "The verification link has expired. Please request a new link.";
      default:
        return "";
    }
  };

  return (
    <div className="animate-in fade-in duration-1000 w-full h-full flex flex-col p-4 md:p-8 justify-center">
      <Card className="w-full md:max-w-md bg-background border-none mx-auto shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription className="text-center">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div
              className={`p-3 rounded-lg ${
                status === "success"
                  ? "bg-green-50 text-green-800"
                  : status === "error"
                    ? "bg-red-50 text-red-800"
                    : "bg-blue-50 text-blue-800"
              }`}
            >
              <p className="text-sm text-center">{message}</p>
            </div>
          )}

          <div className="pt-4 space-y-3">
            {status === "success" && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Automatic redirection in 3 seconds...
                </p>
              </div>
            )}

            {(status === "error" || status === "expired") && (
              <Button asChild className="w-full">
                <Link href="/sign-in">Go to Sign In Page</Link>
              </Button>
            )}

            {status === "success" && (
              <Button asChild className="w-full" variant="outline">
                <Link href="/sign-in">Sign In Now</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
