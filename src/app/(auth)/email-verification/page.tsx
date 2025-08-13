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
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function EmailVerificationPage() {
  const [email, setEmail] = useState<string>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  return (
    <div className="animate-in fade-in duration-1000 w-full h-full flex flex-col p-4 md:p-8 justify-center relative">
      <div className="w-full flex justify-start absolute top-4 left-4">
        <Link href="/sign-in">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-2" />
            Back to Sign In
          </Button>
        </Link>
      </div>

      <Card className="w-full md:max-w-md bg-background border-none mx-auto shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                📧 Email sent to:
              </p>
              <p className="font-medium text-blue-900 text-center">{email}</p>
            </div>
          )}

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-center font-medium">
              🎉 Your account has been created successfully!
            </p>
            <p className="text-green-700 text-center text-sm mt-1">
              A verification email has been sent via Supabase
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">
                  1. Check your inbox
                </p>
                <p>Click the link in the email to activate your account</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">
                  2. Check spam folder
                </p>
                <p>The email might be in your spam or junk folder</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">
                  3. High deliverability email
                </p>
                <p>
                  Emails sent via Supabase infrastructure (95%+ deliverability)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button asChild className="w-full">
              <Link href="/sign-in">Go to Sign In Page</Link>
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              ⚡ Once your email is verified, you can sign in with your
              credentials
            </p>

            <div className="pt-2 border-t">
              <p className="text-xs text-center text-muted-foreground">
                💡 <strong>Tip:</strong> Keep this tab open and check your email
                now
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
