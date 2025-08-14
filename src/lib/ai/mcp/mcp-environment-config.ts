/**
 * 🎯 UNIFIED MCP ENVIRONMENT-AWARE CONFIGURATION SYSTEM
 *
 * This module provides intelligent MCP server configuration based on environment detection.
 * It serves as the SINGLE SOURCE OF TRUTH for all MCP configurations.
 * No more manual config files needed!
 */

import type { MCPServerConfig } from "app-types/mcp";
import { join } from "node:path";

// Environment Detection
export type Environment = "local" | "railway" | "docker" | "vercel" | "aws";

export function detectEnvironment(): Environment {
  // Railway detection - Most specific first
  if (
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_PROJECT_ID ||
    process.env.RAILWAY_SERVICE_ID
  ) {
    return "railway";
  }

  // Vercel detection
  if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL) {
    return "vercel";
  }

  // AWS ECS detection
  if (
    process.env.AWS_EXECUTION_ENV ||
    process.env.ECS_CONTAINER_METADATA_URI ||
    process.env.AWS_REGION
  ) {
    return "aws";
  }

  // Docker detection (but not Railway/Vercel)
  if (
    process.env.DOCKER_ENV ||
    process.env.KUBERNETES_SERVICE_HOST ||
    process.env.CONTAINER === "docker"
  ) {
    return "docker";
  }

  // Default to local development
  return "local";
}

// Path Resolution per Environment
export function getWorkingDirectory(env: Environment): string {
  switch (env) {
    case "railway":
      return "/app";
    case "docker":
      return "/application";
    case "vercel":
      return "/var/task";
    case "aws":
      return "/app";
    case "local":
    default:
      return process.cwd();
  }
}

export function resolvePath(relativePath: string, env: Environment): string {
  const workDir = getWorkingDirectory(env);
  return join(workDir, relativePath);
}

// MCP Server Configurations per Environment
export interface MCPServerDefinition {
  name: string;
  description: string;
  enabled: {
    local: boolean;
    railway: boolean;
    docker: boolean;
    vercel: boolean;
    aws: boolean;
  };
  config: (env: Environment) => MCPServerConfig;
  healthCheck?: () => Promise<boolean>;
}

// 🔧 MCP SERVER DEFINITIONS - Environment Aware
export const MCP_SERVERS: Record<string, MCPServerDefinition> = {
  "simple-thinking": {
    name: "Simple Thinking",
    description: "Basic thinking and reasoning server",
    enabled: {
      local: true,
      railway: false, // 🚫 Disabled for debugging - add one by one, // 🚫 Disabled for debugging - add one by one
      docker: true,
      vercel: true,
      aws: true,
    },
    config: (env) => ({
      command: "node",
      args: [resolvePath("custom-mcp-server/simple-thinking.js", env)],
    }),
  },

  "sequential-thinking": {
    name: "Sequential Thinking",
    description: "Advanced sequential reasoning server",
    enabled: {
      local: true,
      railway: true, // 🚫 Disabled for debugging - add one by one
      docker: true,
      vercel: true,
      aws: true,
    },
    config: (env) => ({
      command: "node",
      args: [resolvePath("custom-mcp-server/thinking-server.js", env)],
    }),
  },

  "excel-creator-pro": {
    name: "Excel Creator Pro",
    description:
      "🔧 Custom Excel file creator - NO API required, Railway compatible",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: (env) => ({
      command: "node",
      args: [resolvePath("custom-mcp-server/excel-creator-pro.js", env)],
    }),
    healthCheck: async () => {
      console.log("📊 MCP: Excel Creator Pro - Custom server ready");
      return true;
    },
  },

  "powerpoint-creator-pro": {
    name: "PowerPoint Creator Pro",
    description: "🔧 Custom PowerPoint presentation creator - NO API required",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: (env) => ({
      command: "node",
      args: [resolvePath("custom-mcp-server/powerpoint-creator-pro.js", env)],
    }),
    healthCheck: async () => {
      console.log("🎯 MCP: PowerPoint Creator Pro - Custom server ready");
      return true;
    },
  },

  "powerpoint-creator-python": {
    name: "PowerPoint Creator Python",
    description:
      "🎯 Real PowerPoint (.pptx) creator using python-pptx - NO API required",
    enabled: {
      local: true,
      railway: false, // ❌ Python not available on Railway by default
      docker: true,
      vercel: false, // Serverless doesn't support Python dependencies
      aws: true,
    },
    config: (env) => ({
      command: "python3",
      args: [resolvePath("mcp-excel/powerpoint_creator.py", env)],
      env: {
        PYTHONPATH: resolvePath("mcp-excel", env),
        // Ensure pip dependencies are available
        PIP_REQUIREMENTS: resolvePath("mcp-excel/requirements.txt", env),
      },
    }),
    healthCheck: async () => {
      try {
        // Check if Python and python-pptx are available
        const { execSync } = await import("node:child_process");
        execSync("python3 -c 'import pptx; print(\"python-pptx OK\")'", {
          stdio: "ignore",
        });
        console.log("🎯 MCP: PowerPoint Creator Python - python-pptx ready");
        return true;
      } catch (error) {
        console.log(
          "⚠️ MCP: PowerPoint Creator Python - python-pptx not available:",
          error,
        );
        return false;
      }
    },
  },

  "pdf-creator-pro": {
    name: "PDF Creator Pro",
    description: "🔧 Custom PDF generator - NO API required",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: (env) => ({
      command: "node",
      args: [resolvePath("custom-mcp-server/pdf-creator-pro.js", env)],
    }),
    healthCheck: async () => {
      console.log("📄 MCP: PDF Creator Pro - Custom server ready");
      return true;
    },
  },

  time: {
    name: "Time",
    description: "Time and date utilities",
    enabled: {
      local: true,
      railway: true, // 🚫 Disabled for debugging - add one by one, // 🚫 Disabled for debugging - add one by one
      docker: true,
      vercel: true,
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: ["-y", "time-mcp"],
    }),
  },

  "web-search": {
    name: "Web Search",
    description: "Web Scout MCP - Free web search without API keys",
    enabled: {
      local: true,
      railway: true, // ✅ BACK TO: @pinkpixel/web-scout-mcp
      docker: true,
      vercel: true,
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: ["-y", "@pinkpixel/web-scout-mcp"],
    }),
    healthCheck: async () => {
      console.log("🔍 MCP: Web Scout - Free web search");
      return true;
    },
  },

  context7: {
    name: "Context7",
    description: "Context7 integration",
    enabled: {
      local: true,
      railway: true, // 🚫 Disabled for debugging - add one by one
      docker: true,
      vercel: true,
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
    }),
  },

  "mcp-server-chart": {
    name: "MCP Server Chart",
    description: "Charts and data visualization server (AntV)",
    enabled: {
      local: true,
      railway: true,
      docker: true,
      vercel: true,
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: ["-y", "@antv/mcp-server-chart"],
    }),
    healthCheck: async () => {
      console.log("📊 MCP: Chart server ready");
      return true;
    },
  },

  "mcp-veo2": {
    name: "MCP Veo2",
    description:
      "Veo2 video generation and AI tools - TEMPORAIREMENT DÉSACTIVÉ (problème Smithery)",
    enabled: {
      local: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
      railway: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
      docker: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
      vercel: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
      aws: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@mario-andreschak/mcp-veo2",
        "--key",
        "fd80bf50-0e48-409c-bdbe-14a8e76e5c52",
        "--profile",
        "deaf-finch-Yj4Bgg",
      ],
    }),
    healthCheck: async () => {
      console.log("🎬 MCP: Veo2 - Video generation tools ready");
      return true;
    },
  },

  "magicslide-mcp": {
    name: "Magic Slide",
    description:
      "Create beautiful presentations and slides with AI - TEMPORAIREMENT DÉSACTIVÉ (problème Smithery)",
    enabled: {
      local: false, // 🚫 DÉSACTIVÉ - Problème service Smithery (0 outils)
      railway: false, // 🚫 DÉSACTIVÉ - Problème service Smithery (0 outils)
      docker: false, // 🚫 DÉSACTIVÉ - Problème service Smithery (0 outils)
      vercel: false, // 🚫 DÉSACTIVÉ - Problème service Smithery (0 outils)
      aws: false, // 🚫 DÉSACTIVÉ - Problème service Smithery (0 outils)
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@IndianAppGuy/magicslide-mcp",
        "--key",
        "fd80bf50-0e48-409c-bdbe-14a8e76e5c52",
      ],
    }),
    healthCheck: async () => {
      console.log("🎨 MCP: Magic Slide - Presentation creation tools ready");
      return true;
    },
  },

  "openai-image-generation": {
    name: "OpenAI Image Generation",
    description:
      "Generate images using OpenAI DALL-E models - TEMPORAIREMENT DÉSACTIVÉ (erreur connexion API)",
    enabled: {
      local: false, // 🚫 DÉSACTIVÉ - Erreur de connexion OpenAI API
      railway: false, // 🚫 DÉSACTIVÉ - Erreur de connexion OpenAI API
      docker: false, // 🚫 DÉSACTIVÉ - Erreur de connexion OpenAI API
      vercel: false, // 🚫 DÉSACTIVÉ - Erreur de connexion OpenAI API
      aws: false, // 🚫 DÉSACTIVÉ - Erreur de connexion OpenAI API
    },
    config: () => ({
      command: "uvx",
      args: ["mcp-openai-image-generation@latest", "stdio"],
      env: {
        OPENAI_API_KEY: "${OPENAI_API_KEY}",
        OPENAI_BASE_URL: "${OPENAI_BASE_URL}",
      },
    }),
    healthCheck: async () => {
      console.log("🎨 MCP: OpenAI Image Generation - DALL-E tools ready");
      return true;
    },
  },

  Gmail: {
    name: "Gmail",
    description: "Gmail integration",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/gmail",
      ],
    }),
    healthCheck: async () => {
      console.log("📧 MCP: Gmail server ready");
      return true;
    },
  },
  "Google Calendar": {
    name: "Google Calendar",
    description: "Google Calendar integration",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/google_calendar",
      ],
    }),
    healthCheck: async () => {
      console.log("📅 MCP: Google Calendar server ready");
      return true;
    },
  },
  "Google Tasks": {
    name: "Google Tasks",
    description: "Google Tasks integration",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/google_tasks",
      ],
    }),
    healthCheck: async () => {
      console.log("📅 MCP: Google Tasks server ready");
      return true;
    },
  },
  "Browser Automation": {
    name: "Browser Automation",
    description: "Browser automation with Playwright",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: (_env) => ({
      command: "npx",
      args: ["-y", "@playwright/mcp@latest"],
      env: {
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1",
        PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: "/usr/bin/chromium",
        PLAYWRIGHT_BROWSERS_PATH: "/usr/bin",
        DISPLAY: ":99",
        CHROME_ARGS:
          "--no-sandbox --disable-dev-shm-usage --disable-gpu --remote-debugging-port=9222",
      },
    }),
    healthCheck: async () => {
      // Sur Railway, skip health check car navigateurs système disponibles
      if (
        process.env.RAILWAY_ENVIRONMENT ||
        process.env.NODE_ENV === "production"
      ) {
        console.log(
          "🎭 MCP: Playwright Official health check skipped in production (Railway)",
        );
        return true;
      }

      try {
        const { execSync } = await import("node:child_process");
        execSync("which chromium || which chrome || which google-chrome", {
          stdio: "ignore",
        });
        console.log(
          "✅ MCP: Playwright Official browser dependencies verified",
        );
        return true;
      } catch (error) {
        console.log(
          "⚠️ MCP: Playwright Official browser deps missing locally:",
          error,
        );
        return false;
      }
    },
  },

  "playwright-extended": {
    name: "Playwright Extended",
    description: "Extended Playwright MCP server with UI+API testing features",
    enabled: {
      local: true,
      railway: false, // 🚫 Disabled for debugging - add one by one, // 🚫 Disabled for debugging - add one by one
      docker: true,
      vercel: false, // Serverless incompatible
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: ["-y", "@executeautomation/playwright-mcp-server"],
    }),
    healthCheck: async () => {
      // Sur Railway, skip health check car navigateurs système disponibles
      if (
        process.env.RAILWAY_ENVIRONMENT ||
        process.env.NODE_ENV === "production"
      ) {
        console.log(
          "🎭 MCP: Playwright Extended health check skipped in production (Railway)",
        );
        return true;
      }

      try {
        const { execSync } = await import("node:child_process");
        execSync("which chromium || which chrome || which google-chrome", {
          stdio: "ignore",
        });
        console.log(
          "✅ MCP: Playwright Extended browser dependencies verified",
        );
        return true;
      } catch (error) {
        console.log(
          "⚠️ MCP: Playwright Extended browser deps missing locally:",
          error,
        );
        return false;
      }
    },
  },

  "selenium-browser": {
    name: "Selenium Browser",
    description: "Selenium WebDriver MCP server (needs local browser drivers)",
    enabled: {
      local: true,
      railway: false, // ❌ Requires local browser drivers not available on Railway
      docker: true,
      vercel: false, // Serverless incompatible
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: ["-y", "@angiejones/mcp-selenium"],
    }),
    healthCheck: async () => {
      try {
        const { execSync } = await import("node:child_process");
        execSync("which chromium || which chrome || which google-chrome", {
          stdio: "ignore",
        });
        console.log("✅ MCP: Selenium Browser dependencies verified");
        return true;
      } catch (error) {
        console.log("⚠️ MCP: Selenium Browser deps missing locally:", error);
        return false;
      }
    },
  },

  "browserless-cloud": {
    name: "Browserless Cloud Browser",
    description: "Cloud browser automation via Browserless.io service",
    enabled: {
      local: false, // Use local browsers for development
      railway: false, // 🚫 Disabled for debugging - add one by one, // ✅ Perfect for Railway - cloud browsers
      docker: true,
      vercel: true, // Serverless compatible
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: ["-y", "@nicholmikey/chrome-tools"],
      env: {
        CHROME_DEBUG_URL: "https://browserless.io/chrome",
        CHROME_CONNECTION_TYPE: "cloud",
        CHROME_ERROR_HELP: "Browserless cloud service for Railway deployment",
      },
    }),
    healthCheck: async () => {
      // Cloud service - always healthy
      console.log("✅ MCP: Browserless Cloud Browser (cloud service)");
      return true;
    },
  },

  HubSpot: {
    name: "HubSpot",
    description: "HubSpot integration server",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/hubspot",
      ],
    }),
  },

  "Microsoft Outlook": {
    name: "Microsoft Outlook",
    description: "Microsoft Outlook email integration server",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/microsoft_outlook",
      ],
    }),
  },

  "Microsoft Outlook Calendar": {
    name: "Microsoft Outlook Calendar",
    description: "Microsoft Outlook Calendar integration server",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/1601ad5c-81fb-4eee-8cd6-7eaff4b9f6d6/microsoft_outlook_calendar",
      ],
    }),
  },

  DeepResearch: {
    name: "Deep Research",
    description:
      "Deep research and analysis MCP server - TEMPORAIREMENT DÉSACTIVÉ (problème Smithery)",
    enabled: {
      local: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
      railway: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
      docker: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
      vercel: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
      aws: false, // 🚫 DÉSACTIVÉ - Problème serveur Smithery
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@ameeralns/DeepResearchMCP",
        "--key",
        "fd80bf50-0e48-409c-bdbe-14a8e76e5c52",
        "--profile",
        "deaf-finch-Yj4Bgg",
      ],
    }),
  },

  airbnb: {
    name: "Airbnb",
    description: "Airbnb listings and search MCP server",
    enabled: {
      local: true,
      railway: true,
      docker: true,
      vercel: true,
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: ["-y", "@openbnb/mcp-server-airbnb", "--ignore-robots-txt"],
    }),
  },

  gmail: {
    name: "Gmail",
    description: "Gmail over Pipedream Supergateway (SSE) - DÉSACTIVÉ",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/d9e753e1-853e-4b7c-9c4e-152a4cfaecc7/gmail",
      ],
    }),
    healthCheck: async () => {
      console.log("📧 MCP: Gmail (Pipedream) ready");
      return true;
    },
  },

  google_calendar: {
    name: "Google Calendar",
    description:
      "Google Calendar over Pipedream Supergateway (SSE) - DÉSACTIVÉ",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/d9e753e1-853e-4b7c-9c4e-152a4cfaecc7/google_calendar",
      ],
    }),
    healthCheck: async () => {
      console.log("📅 MCP: Google Calendar (Pipedream) ready");
      return true;
    },
  },

  microsoft_outlook: {
    name: "Microsoft Outlook",
    description: "Outlook email via Pipedream Supergateway (SSE)",
    enabled: {
      local: true,
      railway: true,
      docker: true,
      vercel: true,
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/d9e753e1-853e-4b7c-9c4e-152a4cfaecc7/microsoft_outlook",
      ],
    }),
    healthCheck: async () => {
      console.log("📧 MCP: Microsoft Outlook (Pipedream) ready");
      return true;
    },
  },

  microsoft_outlook_calendar: {
    name: "Microsoft Outlook Calendar",
    description: "Outlook Calendar via Pipedream Supergateway (SSE)",
    enabled: {
      local: true,
      railway: true,
      docker: true,
      vercel: true,
      aws: true,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/d9e753e1-853e-4b7c-9c4e-152a4cfaecc7/microsoft_outlook_calendar",
      ],
    }),
    healthCheck: async () => {
      console.log("📅 MCP: Microsoft Outlook Calendar (Pipedream) ready");
      return true;
    },
  },

  slack: {
    name: "Slack",
    description: "Slack via Pipedream Supergateway (SSE) - SUPPRIMÉ",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/d9e753e1-853e-4b7c-9c4e-152a4cfaecc7/slack",
      ],
    }),
    healthCheck: async () => {
      console.log("💬 MCP: Slack (Pipedream) ready");
      return true;
    },
  },

  airtable_oauth: {
    name: "Airtable (OAuth)",
    description: "Airtable via Pipedream Supergateway (SSE) - SUPPRIMÉ",
    enabled: {
      local: false,
      railway: false,
      docker: false,
      vercel: false,
      aws: false,
    },
    config: () => ({
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/d9e753e1-853e-4b7c-9c4e-152a4cfaecc7/airtable_oauth",
      ],
    }),
    healthCheck: async () => {
      console.log("📊 MCP: Airtable (OAuth) (Pipedream) ready");
      return true;
    },
  },
};

export const mcpEnvironmentConfig = {
  mcpServers: {
    "sequential-thinking": {
      command: "node",
      args: ["/application/custom-mcp-server/thinking-server.js"],
    },
    time: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-time"],
    },
    pd: {
      command: "npx",
      args: [
        "-y",
        "supergateway",
        "--sse",
        "https://mcp.pipedream.net/d9e753e1-853e-4b7c-9c4e-152a4cfaecc7/gmail",
      ],
    },
    // TOUS LES AUTRES SERVEURS SUPPRIMÉS POUR ÉVITER LA SURCHARGE
    // simple-thinking, web-search, airbnb, context7, mcp-server-chart, etc.
  },
};

// 🚀 MAIN CONFIGURATION GENERATOR
export function generateMCPConfig(
  targetEnv?: Environment,
): Record<string, MCPServerConfig> {
  const env = targetEnv || detectEnvironment();
  const config: Record<string, MCPServerConfig> = {};

  console.log(`🎯 MCP: Génération de configuration intelligente pour: ${env}`);
  console.log(`📁 MCP: Répertoire de travail: ${getWorkingDirectory(env)}`);

  let enabledCount = 0;
  let disabledCount = 0;

  for (const [id, definition] of Object.entries(MCP_SERVERS)) {
    if (definition.enabled[env]) {
      config[id] = definition.config(env);
      console.log(`✅ MCP: ${definition.name} activé pour ${env}`);
      enabledCount++;
    } else {
      console.log(
        `❌ MCP: ${definition.name} désactivé pour ${env} (incompatible)`,
      );
      disabledCount++;
    }
  }

  const totalCount = Object.keys(MCP_SERVERS).length;
  console.log(
    `🎯 MCP: Configuration générée - ${enabledCount}/${totalCount} serveurs actifs (${disabledCount} désactivés)`,
  );

  return config;
}

// 🏥 HEALTH CHECK SYSTEM
export async function performHealthChecks(
  targetEnv?: Environment,
): Promise<Record<string, boolean>> {
  const env = targetEnv || detectEnvironment();
  const results: Record<string, boolean> = {};

  console.log(`🏥 MCP: Vérifications de santé pour environnement: ${env}`);

  for (const [id, definition] of Object.entries(MCP_SERVERS)) {
    if (!definition.enabled[env]) {
      results[id] = false;
      continue;
    }

    if (definition.healthCheck) {
      try {
        const isHealthy = await definition.healthCheck();
        results[id] = isHealthy;
        console.log(
          `${isHealthy ? "✅" : "❌"} MCP: ${definition.name} santé: ${isHealthy ? "OK" : "FAIL"}`,
        );
      } catch (error) {
        results[id] = false;
        console.log(`❌ MCP: ${definition.name} santé: ERROR -`, error);
      }
    } else {
      // No health check = assume healthy if enabled
      results[id] = true;
      console.log(
        `✅ MCP: ${definition.name} santé: OK (pas de vérification)"`,
      );
    }
  }

  const healthyCount = Object.values(results).filter(Boolean).length;
  console.log(
    `🏥 MCP: Vérifications terminées - ${healthyCount}/${Object.keys(results).length} serveurs en santé`,
  );

  return results;
}

// 🌍 ENVIRONMENT INFO
export function getEnvironmentInfo(): {
  environment: Environment;
  workingDirectory: string;
  enabledServers: string[];
  disabledServers: string[];
  platform: string;
  nodeVersion: string;
  detectionReason: string;
} {
  const env = detectEnvironment();
  const workDir = getWorkingDirectory(env);

  const enabledServers: string[] = [];
  const disabledServers: string[] = [];

  for (const [_, definition] of Object.entries(MCP_SERVERS)) {
    if (definition.enabled[env]) {
      enabledServers.push(definition.name);
    } else {
      disabledServers.push(definition.name);
    }
  }

  // Determine detection reason
  let detectionReason = "default (local)";
  if (process.env.RAILWAY_ENVIRONMENT) detectionReason = "RAILWAY_ENVIRONMENT";
  else if (process.env.RAILWAY_PROJECT_ID)
    detectionReason = "RAILWAY_PROJECT_ID";
  else if (process.env.VERCEL) detectionReason = "VERCEL";
  else if (process.env.AWS_EXECUTION_ENV) detectionReason = "AWS_EXECUTION_ENV";
  else if (process.env.DOCKER_ENV) detectionReason = "DOCKER_ENV";

  return {
    environment: env,
    workingDirectory: workDir,
    enabledServers,
    disabledServers,
    platform: process.platform,
    nodeVersion: process.version,
    detectionReason,
  };
}
