#!/usr/bin/env node

/**
 * 📄 PDF Creator Pro - MCP Server
 * Serveur MCP personnalisé pour créer des fichiers PDF
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

class PDFCreatorProServer {
  constructor() {
    this.server = new Server(
      {
        name: "pdf-creator-pro",
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
          name: "create_pdf_document",
          description: "📄 Créer un document PDF professionnel",
          inputSchema: {
            type: "object",
            properties: {
              filename: {
                type: "string",
                description: "Nom du fichier PDF (sans extension)",
              },
              title: {
                type: "string",
                description: "Titre du document",
              },
              content: {
                type: "string",
                description: "Contenu principal du document",
              },
              author: {
                type: "string",
                description: "Auteur du document (optionnel)",
                default: "Sara LakayAI",
              },
              style: {
                type: "string",
                description: "Style du document",
                enum: ["report", "letter", "manual", "invoice"],
                default: "report",
              },
            },
            required: ["filename", "title", "content"],
          },
        },
        {
          name: "create_pdf_report",
          description: "📊 Créer un rapport PDF avec sections et données",
          inputSchema: {
            type: "object",
            properties: {
              filename: { type: "string", description: "Nom du fichier PDF" },
              title: { type: "string", description: "Titre du rapport" },
              sections: {
                type: "array",
                description: "Sections du rapport",
                items: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "Titre de la section",
                    },
                    content: {
                      type: "string",
                      description: "Contenu de la section",
                    },
                    data: {
                      type: "array",
                      description: "Données tabulaires (optionnel)",
                      items: { type: "array", items: { type: "string" } },
                    },
                  },
                  required: ["title", "content"],
                },
              },
              summary: {
                type: "string",
                description: "Résumé exécutif (optionnel)",
              },
            },
            required: ["filename", "title", "sections"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "create_pdf_document":
          return await this.createPDFDocument(request.params.arguments);
        case "create_pdf_report":
          return await this.createPDFReport(request.params.arguments);
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

📋 INSTRUCTIONS POUR CRÉER LE FICHIER PDF :
1. Copiez tout le contenu HTML ci-dessus (sélectionnez et Ctrl+C/Cmd+C)
2. Ouvrez un éditeur de texte (Notepad, VS Code, etc.)
3. Collez le contenu (Ctrl+V/Cmd+V)
4. Enregistrez sous "${filename.replace(".pdf", ".html")}" avec l'extension .html
5. Ouvrez le fichier .html dans votre navigateur
6. Imprimez en PDF (Ctrl+P puis "Enregistrer en PDF")

⚠️ Le téléchargement automatique n'est pas disponible, mais vous pouvez créer le fichier manuellement avec ces données.`;
  }

  async createPDFDocument(args) {
    try {
      const { filename, title, content, author, style } = args;

      // Créer le contenu HTML optimisé pour PDF
      const htmlContent = this.generatePDFHTML(title, content, author, style);
      const fullFilename = `${filename}.html`;

      // Créer le lien de téléchargement
      const downloadUrl = await this.createDownloadLink(
        htmlContent,
        fullFilename,
      );

      return {
        content: [
          {
            type: "text",
            text: `📄 Document PDF créé avec succès !
             
📊 **Détails :**
- **Fichier** : ${fullFilename}
- **Titre** : ${title}
- **Auteur** : ${author || "Sara LakayAI"}
- **Style** : ${style || "report"}
- **Taille** : ${Math.round(content.length / 1024)} Ko de contenu

🔗 **LIEN DE TÉLÉCHARGEMENT** : ${downloadUrl}

📈 **Contenu :**
${content.substring(0, 200)}${content.length > 200 ? "..." : ""}

💡 **Note** : Ouvrez le fichier HTML et utilisez "Imprimer > Enregistrer en PDF" pour obtenir un vrai PDF !`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Erreur lors de la création du document PDF: ${error.message}`,
      );
    }
  }

  async createPDFReport(args) {
    try {
      const { filename, title, sections, summary } = args;

      // Créer le contenu HTML du rapport
      const htmlContent = this.generateReportHTML(title, sections, summary);
      const fullFilename = `${filename}.html`;

      // Créer le lien de téléchargement
      const downloadUrl = await this.createDownloadLink(
        htmlContent,
        fullFilename,
      );

      return {
        content: [
          {
            type: "text",
            text: `📊 Rapport PDF professionnel créé !
             
📊 **Détails :**
- **Fichier** : ${fullFilename}
- **Titre** : ${title}
- **Sections** : ${sections.length}
- **Résumé** : ${summary ? "Inclus" : "Non inclus"}

🔗 **LIEN DE TÉLÉCHARGEMENT** : ${downloadUrl}

📈 **Structure du rapport :**
${sections.map((section, index) => `${index + 1}. ${section.title}`).join("\n")}

💡 **Note** : Utilisez "Imprimer > Enregistrer en PDF" pour créer le PDF final !`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Erreur lors de la création du rapport PDF: ${error.message}`,
      );
    }
  }

  generatePDFHTML(title, content, author, style) {
    const styleCSS = {
      report: `
        body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; }
        .header { border-bottom: 3px solid #2c3e50; margin-bottom: 30px; }
        h1 { color: #2c3e50; font-size: 2.5em; }
      `,
      letter: `
        body { font-family: 'Arial', sans-serif; line-height: 1.8; color: #444; }
        .header { border-bottom: 1px solid #ccc; margin-bottom: 20px; }
        h1 { color: #34495e; font-size: 2em; }
      `,
      manual: `
        body { font-family: 'Calibri', sans-serif; line-height: 1.5; color: #2c3e50; }
        .header { background: #ecf0f1; padding: 20px; margin-bottom: 25px; }
        h1 { color: #2980b9; font-size: 2.2em; }
      `,
      invoice: `
        body { font-family: 'Helvetica', sans-serif; line-height: 1.4; color: #2c3e50; }
        .header { border: 2px solid #3498db; padding: 15px; margin-bottom: 25px; }
        h1 { color: #3498db; font-size: 2em; }
      `,
    };

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${styleCSS[style] || styleCSS.report}
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
        }
        .content {
            text-align: justify;
            margin: 30px 0;
            font-size: 1.1em;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #bdc3c7;
            font-size: 0.9em;
            color: #7f8c8d;
            text-align: center;
        }
        @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
        }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p><strong>Auteur:</strong> ${author || "Sara LakayAI"}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString("fr-FR")}</p>
    </div>
    
    <div class="content">
        ${content
          .split("\n")
          .map((paragraph) => (paragraph.trim() ? `<p>${paragraph}</p>` : ""))
          .join("")}
    </div>
    
    <div class="footer">
        <p>Document généré par Sara LakayAI | ${new Date().toLocaleDateString("fr-FR")}</p>
        <p>Style: ${style || "report"} | Type: ${title}</p>
    </div>
</body>
</html>`;
  }

  generateReportHTML(title, sections, summary) {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.6;
            color: #2c3e50;
            background: white;
        }
        .cover {
            text-align: center;
            margin-bottom: 50px;
            padding: 40px;
            border: 2px solid #3498db;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        }
        .cover h1 {
            font-size: 3em;
            color: #2980b9;
            margin-bottom: 20px;
        }
        .toc {
            background: #f8f9fa;
            padding: 25px;
            margin: 30px 0;
            border-left: 5px solid #3498db;
        }
        .toc h2 {
            color: #2980b9;
            margin-bottom: 15px;
        }
        .toc ul {
            list-style: none;
            padding: 0;
        }
        .toc li {
            padding: 8px 0;
            border-bottom: 1px dotted #bdc3c7;
        }
        .section {
            margin: 40px 0;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #2c3e50;
            font-size: 1.8em;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .section-content {
            text-align: justify;
            margin: 20px 0;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .data-table th, .data-table td {
            border: 1px solid #bdc3c7;
            padding: 12px;
            text-align: left;
        }
        .data-table th {
            background: #3498db;
            color: white;
            font-weight: bold;
        }
        .data-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .summary {
            background: #e8f6f3;
            padding: 25px;
            margin: 30px 0;
            border-left: 5px solid #27ae60;
        }
        .summary h2 {
            color: #27ae60;
            margin-bottom: 15px;
        }
        .footer {
            margin-top: 50px;
            padding: 20px;
            text-align: center;
            background: #ecf0f1;
            color: #7f8c8d;
            font-size: 0.9em;
        }
        @media print {
            body { margin: 0; padding: 20px; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="cover">
        <h1>${title}</h1>
        <p style="font-size: 1.3em; color: #7f8c8d;">Rapport généré par Sara LakayAI</p>
        <p style="font-size: 1.1em;"><strong>Date:</strong> ${new Date().toLocaleDateString("fr-FR")}</p>
    </div>
    
    ${
      summary
        ? `
    <div class="summary">
        <h2>🎯 Résumé Exécutif</h2>
        <p>${summary}</p>
    </div>
    `
        : ""
    }
    
    <div class="toc">
        <h2>📋 Table des Matières</h2>
        <ul>
            ${sections
              .map(
                (section, index) => `
                <li><strong>${index + 1}.</strong> ${section.title}</li>
            `,
              )
              .join("")}
        </ul>
    </div>
    
    <div class="page-break"></div>
    
    ${sections
      .map(
        (section, index) => `
    <div class="section">
        <h2>${index + 1}. ${section.title}</h2>
        <div class="section-content">
            ${section.content
              .split("\n")
              .map((paragraph) =>
                paragraph.trim() ? `<p>${paragraph}</p>` : "",
              )
              .join("")}
        </div>
        
        ${
          section.data && section.data.length > 0
            ? `
        <table class="data-table">
            <thead>
                <tr>
                    ${section.data[0].map((header) => `<th>${header}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
                ${section.data
                  .slice(1)
                  .map(
                    (row) => `
                <tr>
                    ${row.map((cell) => `<td>${cell}</td>`).join("")}
                </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
        `
            : ""
        }
    </div>
    `,
      )
      .join("")}
    
    <div class="footer">
        <p><strong>Rapport généré par Sara LakayAI</strong></p>
        <p>Date de génération: ${new Date().toLocaleString("fr-FR")}</p>
        <p>Sections: ${sections.length} | Pages: Variable selon le contenu</p>
    </div>
</body>
</html>`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("📄 PDF Creator Pro MCP server running on stdio");
  }
}

const server = new PDFCreatorProServer();
server.run().catch(console.error);
