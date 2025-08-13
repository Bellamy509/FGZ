"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { STRIPE_PLANS } from "@/lib/stripe/config";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";

export function SubscriptionCard() {
  const [loading, setLoading] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<{
    publishableKey: string;
    isConfigured: boolean;
    priceId: string;
  } | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch Stripe configuration from API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/stripe/config");
        const config = await response.json();
        setStripeConfig(config);
      } catch (error) {
        console.error("Failed to fetch Stripe config:", error);
        setStripeConfig({
          publishableKey: "",
          isConfigured: false,
          priceId: "",
        });
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSubscribe = async () => {
    // Check if configuration is loaded and Stripe is configured
    if (!stripeConfig?.isConfigured) {
      toast.error("Stripe is not configured. Please contact support.");
      return;
    }

    if (!stripeConfig.publishableKey) {
      toast.error("Payment system is not available. Please try again later.");
      return;
    }

    try {
      setLoading(true);

      // Initialize Stripe with the publishable key from API
      const stripe = await loadStripe(stripeConfig.publishableKey);

      if (!stripe) {
        toast.error("Failed to load payment system. Please try again later.");
        return;
      }

      // Create subscription and payment intent
      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: stripeConfig.priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }

      // The page will be redirected to Stripe's checkout page
    } catch (error) {
      console.error("Subscription error:", error);

      // Handle specific error types
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Free Plan */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold">{STRIPE_PLANS.FREE.name}</h3>
        <p className="mt-2 text-gray-500">
          Get started with {STRIPE_PLANS.FREE.credits} free credits
        </p>
        <div className="mt-4">
          <p className="text-3xl font-bold">$0</p>
          <p className="text-sm text-gray-500">Free forever</p>
        </div>
        <Button className="mt-6 w-full" variant="outline" disabled>
          Current Plan
        </Button>
      </Card>

      {/* Pro Plan */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold">{STRIPE_PLANS.PRO.name}</h3>
        <p className="mt-2 text-gray-500">
          Unlimited credits for your projects
        </p>
        <div className="mt-4">
          <p className="text-3xl font-bold">${STRIPE_PLANS.PRO.price}</p>
          <p className="text-sm text-gray-500">per month</p>
        </div>
        <Button
          className="mt-6 w-full"
          onClick={handleSubscribe}
          disabled={loading || !stripeConfig?.isConfigured}
        >
          {loading
            ? "Processing..."
            : !stripeConfig?.isConfigured
              ? "Payment not available"
              : "Upgrade to Pro"}
        </Button>
      </Card>
    </div>
  );
}
