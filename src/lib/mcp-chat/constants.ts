export const isProductionEnvironment = process.env.NODE_ENV === "production";

export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

// Auth is disabled when DISABLE_AUTH is explicitly set to 'true'
// This flag should only be used in development environments
export const isAuthDisabled = process.env.DISABLE_AUTH === "true";

// Database persistence is disabled when DISABLE_PERSISTENCE is explicitly set to 'true'
// This allows testing without setting up Supabase/PostgreSQL database
export const isPersistenceDisabled = process.env.DISABLE_PERSISTENCE === "true";

// Session duration for guest sessions (24 hours in milliseconds)
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// Banner theme styles for different message types
export const BANNER_THEMES = {
  warning: {
    container:
      "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200",
    icon: "text-amber-600 dark:text-amber-400",
  },
  info: {
    container:
      "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
    icon: "text-blue-600 dark:text-blue-400",
  },
} as const;

// Base metadata used throughout the application
export const BASE_SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://david-ai.com";
export const BASE_TITLE = "David AI";
export const BASE_DESCRIPTION =
  "David AI - Your intelligent assistant with integrated tools and advanced AI capabilities";

export const BASE_METADATA = {
  metadataBase: new URL(BASE_SITE_URL),
  title: BASE_TITLE,
  description: BASE_DESCRIPTION,
  openGraph: {
    title: BASE_TITLE,
    description: BASE_DESCRIPTION,
    url: BASE_SITE_URL,
    siteName: BASE_TITLE,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "David AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BASE_TITLE,
    description: BASE_DESCRIPTION,
    creator: "@david_ai",
    images: [
      {
        url: "/twitter-image.png",
        width: 1200,
        height: 630,
        alt: "David AI",
      },
    ],
  },
};
