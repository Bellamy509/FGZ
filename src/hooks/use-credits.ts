import useSWR from "swr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserCreditsResponse {
  success: boolean;
  credits: number;
  wasCredited: boolean;
  error?: string;
}

export function useCredits() {
  const router = useRouter();

  const { data: creditsData, mutate } = useSWR<UserCreditsResponse>(
    "/api/user/credits",
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }
      return response.json();
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const credits = creditsData?.credits ?? 0;
  const hasCredits = credits > 0;
  const isLowCredits = credits > 0 && credits <= 10; // Warning when 10 or fewer credits

  const showUpgradeAlert = (
    context: "chat" | "voice" | "upload" | "general",
  ) => {
    const messages = {
      chat: "No credits remaining for chat. Upgrade to continue conversations!",
      voice:
        "No credits for voice transcription. Upgrade for unlimited voice features!",
      upload:
        "No credits for file uploads. Upgrade to upload documents and images!",
      general:
        "Credits exhausted! Upgrade to Pro for unlimited access to all features.",
    };

    toast.error(messages[context], {
      duration: 8000,
      action: {
        label: "Upgrade Now",
        onClick: () => router.push("/settings/subscription"),
      },
    });
  };

  const showLowCreditsWarning = () => {
    if (isLowCredits) {
      toast.warning(
        `Only ${credits} credits remaining. Consider upgrading soon!`,
        {
          duration: 5000,
          action: {
            label: "Upgrade",
            onClick: () => router.push("/settings/subscription"),
          },
        },
      );
    }
  };

  const checkCreditsForAction = (
    action: "chat" | "voice" | "upload",
    requiredCredits: number = 1,
  ): boolean => {
    if (credits < requiredCredits) {
      showUpgradeAlert(action);
      return false;
    }
    return true;
  };

  return {
    credits,
    hasCredits,
    isLowCredits,
    isLoading: !creditsData,
    showUpgradeAlert,
    showLowCreditsWarning,
    checkCreditsForAction,
    refreshCredits: mutate,
  };
}
