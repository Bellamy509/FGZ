#!/usr/bin/env node

/**
 * 📊 Excel Creator Pro - MCP Server
 * Serveur MCP personnalisé pour créer des fichiers Excel
 * Compatible Railway - Aucune API requise
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

class ExcelCreatorProServer {
  constructor() {
    this.server = new Server(
      {
        name: "excel-creator-pro",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "create_excel_simple",
          description:
            "📊 Créer un fichier Excel/CSV avec données et lien de téléchargement",
          inputSchema: {
            type: "object",
            properties: {
              filename: {
                type: "string",
                description: "Nom du fichier Excel (sans extension)",
              },
              data: {
                type: "array",
                description: "Données en format CSV (lignes séparées)",
                items: { type: "string" },
              },
              title: {
                type: "string",
                description: "Titre du fichier",
              },
            },
            required: ["filename", "data"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "create_excel_simple":
          return await this.createExcelSimple(request.params.arguments);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`,
          );
      }
    });
  }

  async createDownloadLink(content, filename) {
    try {
      // Railway auto-detects the correct URL from environment
      const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : process.env.NEXTAUTH_URL
          ? process.env.NEXTAUTH_URL
          : process.env.NODE_ENV === "production"
            ? "https://david-ai.com" // Generic fallback - should be configured via env vars
            : "http://localhost:3000";

      console.log(`Trying to create download link with baseUrl: ${baseUrl}`);

      const response = await fetch(`${baseUrl}/api/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          filename,
        }),
      });

      if (!response.ok) {
        console.error(
          `Download API failed: ${response.status} - ${response.statusText}`,
        );
        throw new Error(`Download API failed: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Download link created: ${result.downloadUrl}`);
      return result.downloadUrl;
    } catch (error) {
      console.error("Download link creation failed:", error);
      // Fallback: return data inline for copy-paste
      return this.createDataResponse(content, filename);
    }
  }

  createDataResponse(content, filename) {
    // When download API fails, return formatted data for copy-paste
    return `DONNÉES POUR ${filename.toUpperCase()}:

${content}

📋 INSTRUCTIONS POUR CRÉER LE FICHIER :
1. Copiez tout le contenu ci-dessus (sélectionnez et Ctrl+C/Cmd+C)
2. Ouvrez Excel ou un éditeur de texte
3. Collez les données (Ctrl+V/Cmd+V)
4. Enregistrez sous "${filename}"

⚠️ Le téléchargement automatique n'est pas disponible, mais vous pouvez créer le fichier manuellement avec ces données.`;
  }

  async createExcelSimple(args) {
    try {
      const { filename, data, title } = args;

      // Créer le contenu CSV
      let csvContent = "";
      if (title) {
        csvContent += `${title}\n\n`;
      }

      csvContent += data.join("\n");

      // Nom de fichier avec extension
      const fullFilename = `${filename}.csv`;

      // Créer le lien de téléchargement
      const downloadUrl = await this.createDownloadLink(
        csvContent,
        fullFilename,
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Fichier Excel/CSV créé avec succès !
            
📊 **Détails :**
- **Fichier** : ${fullFilename}
- **Lignes** : ${data.length}
- **Titre** : ${title || "Aucun"}
- **Format** : CSV (Compatible Excel)

🔗 **LIEN DE TÉLÉCHARGEMENT** : ${downloadUrl}

📈 **Aperçu du contenu :**
${data.slice(0, 3).join("\n")}${data.length > 3 ? "\n... et " + (data.length - 3) + " lignes de plus" : ""}

💡 **Note** : Le fichier CSV peut être ouvert directement dans Excel !`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Erreur lors de la création du fichier Excel: ${error.message}`,
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("📊 Excel Creator Pro MCP server running on stdio");
  }
}

const server = new ExcelCreatorProServer();
server.run().catch(console.error);
