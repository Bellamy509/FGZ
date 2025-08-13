import { Alert, AlertDescription, AlertTitle } from "ui/alert";
import { Button } from "ui/button";
import { CreditCard, AlertTriangle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCredits } from "@/hooks/use-credits";

interface UpgradeAlertProps {
  context?: "chat" | "mcp" | "general";
  showWhenLowCredits?: boolean;
  className?: string;
}

export function UpgradeAlert({
  context = "general",
  showWhenLowCredits = true,
  className = "",
}: UpgradeAlertProps) {
  const router = useRouter();
  const { credits, hasCredits, isLowCredits } = useCredits();

  // Don't show if user has enough credits
  if (hasCredits && (!showWhenLowCredits || !isLowCredits)) {
    return null;
  }

  const handleUpgrade = () => {
    router.push("/settings/subscription");
  };

  const getAlertContent = () => {
    if (!hasCredits) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        title: "Credits Exhausted!",
        description:
          "You've used all your free credits. Upgrade to Pro for unlimited access to chat, voice transcription, and file uploads.",
        buttonText: "Upgrade to Pro",
        variant: "destructive" as const,
      };
    }

    if (isLowCredits) {
      return {
        icon: <Zap className="h-4 w-4" />,
        title: `Only ${credits} Credits Remaining`,
        description:
          "You're running low on credits. Upgrade to Pro for unlimited usage and never worry about limits again.",
        buttonText: "Upgrade Now",
        variant: "default" as const,
      };
    }

    return null;
  };

  const alertContent = getAlertContent();
  if (!alertContent) return null;

  const contextMessages = {
    chat: "Continue your conversations without interruption.",
    mcp: "Keep using all MCP tools and features.",
    general: "Access all features unlimited.",
  };

  return (
    <Alert variant={alertContent.variant} className={`border-2 ${className}`}>
      <div className="flex items-start gap-3">
        {alertContent.icon}
        <div className="flex-1">
          <AlertTitle className="mb-1">{alertContent.title}</AlertTitle>
          <AlertDescription className="mb-3">
            {alertContent.description} {contextMessages[context]}
          </AlertDescription>
          <Button
            onClick={handleUpgrade}
            size="sm"
            className="gap-2"
            variant={
              alertContent.variant === "destructive" ? "default" : "default"
            }
          >
            <CreditCard className="h-4 w-4" />
            {alertContent.buttonText}
          </Button>
        </div>
      </div>
    </Alert>
  );
}
