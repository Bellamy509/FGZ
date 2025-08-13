#!/usr/bin/env node

/**
 * 🎯 PowerPoint Creator Pro - MCP Server
 * Serveur MCP personnalisé pour créer des présentations PowerPoint
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

class PowerPointCreatorProServer {
  constructor() {
    this.server = new Server(
      {
        name: "powerpoint-creator-pro",
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
          name: "create_presentation",
          description: "🎯 Créer une présentation PowerPoint avec slides",
          inputSchema: {
            type: "object",
            properties: {
              filename: {
                type: "string",
                description: "Nom du fichier PowerPoint (sans extension)",
              },
              title: {
                type: "string",
                description: "Titre de la présentation",
              },
              slides: {
                type: "array",
                description: "Liste des slides à créer",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Titre du slide" },
                    content: {
                      type: "array",
                      description: "Points de contenu du slide",
                      items: { type: "string" },
                    },
                    notes: {
                      type: "string",
                      description: "Notes du présentateur (optionnel)",
                    },
                  },
                  required: ["title", "content"],
                },
              },
              theme: {
                type: "string",
                description: "Thème de la présentation",
                enum: ["business", "creative", "minimal", "modern"],
                default: "business",
              },
            },
            required: ["filename", "title", "slides"],
          },
        },
        {
          name: "create_simple_presentation",
          description: "📋 Créer une présentation simple à partir de texte",
          inputSchema: {
            type: "object",
            properties: {
              filename: { type: "string", description: "Nom du fichier" },
              title: { type: "string", description: "Titre principal" },
              content: {
                type: "string",
                description:
                  "Contenu de la présentation (sera divisé en slides)",
              },
            },
            required: ["filename", "title", "content"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "create_presentation":
          return await this.createPresentation(request.params.arguments);
        case "create_simple_presentation":
          return await this.createSimplePresentation(request.params.arguments);
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
1. Copiez tout le contenu HTML ci-dessus (sélectionnez et Ctrl+C/Cmd+C)
2. Ouvrez un éditeur de texte (Notepad, VS Code, etc.)
3. Collez le contenu (Ctrl+V/Cmd+V)
4. Enregistrez sous "${filename}" avec l'extension .html
5. Ouvrez le fichier .html dans votre navigateur
6. Utilisez le mode présentation (F11) pour plein écran

⚠️ Le téléchargement automatique n'est pas disponible, mais vous pouvez créer le fichier manuellement avec ces données.`;
  }

  async createPresentation(args) {
    try {
      const { filename, title, slides, theme } = args;

      // Créer le contenu HTML de la présentation
      const htmlContent = this.generatePresentationHTML(title, slides, theme);
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
            text: `🎯 Présentation PowerPoint créée avec succès !
            
📊 **Détails :**
- **Fichier** : ${filename}.html
- **Emplacement** : ${filePath}
- **Titre** : ${title}
- **Slides** : ${slides.length}
- **Thème** : ${theme || "business"}

🔗 **LIEN DE TÉLÉCHARGEMENT** : ${downloadUrl}

📈 **Structure de la présentation :**
${slides.map((slide, index) => `${index + 1}. ${slide.title} (${slide.content.length} points)`).join("\n")}

💡 **Note** : Ouvrez le fichier HTML dans votre navigateur pour voir la présentation !`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Erreur lors de la création de la présentation: ${error.message}`,
      );
    }
  }

  async createSimplePresentation(args) {
    try {
      const { filename, title, content } = args;

      // Diviser le contenu en slides automatiquement
      const paragraphs = content.split("\n").filter((p) => p.trim().length > 0);
      const slides = [];

      // Slide de titre
      slides.push({
        title: title,
        content: ["Présentation générée automatiquement", "Par Sara LakayAI"],
        notes: "Slide de titre principal",
      });

      // Diviser le contenu en chunks de 3-4 points par slide
      for (let i = 0; i < paragraphs.length; i += 3) {
        const slideContent = paragraphs.slice(i, i + 3);
        slides.push({
          title: `Section ${Math.floor(i / 3) + 1}`,
          content: slideContent,
          notes: `Slide généré automatiquement - Section ${Math.floor(i / 3) + 1}`,
        });
      }

      // Utiliser la méthode de création de présentation
      return await this.createPresentation({
        filename,
        title,
        slides,
        theme: "modern",
      });
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Erreur lors de la création de la présentation simple: ${error.message}`,
      );
    }
  }

  generatePresentationHTML(title, slides, theme) {
    const themeColors = {
      business: {
        primary: "#1f4e79",
        secondary: "#4472C4",
        background: "#f8f9fa",
      },
      creative: {
        primary: "#e74c3c",
        secondary: "#f39c12",
        background: "#ecf0f1",
      },
      minimal: {
        primary: "#2c3e50",
        secondary: "#95a5a6",
        background: "#ffffff",
      },
      modern: {
        primary: "#6c5ce7",
        secondary: "#74b9ff",
        background: "#f0f3ff",
      },
    };

    const colors = themeColors[theme] || themeColors.business;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: ${colors.background};
            color: #333;
        }
        .presentation {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        .slide {
            background: white;
            margin: 30px 0;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            min-height: 400px;
            border-left: 5px solid ${colors.primary};
        }
        .slide h1 {
            color: ${colors.primary};
            font-size: 2.5em;
            margin-bottom: 30px;
            text-align: center;
        }
        .slide h2 {
            color: ${colors.primary};
            font-size: 2em;
            margin-bottom: 25px;
            border-bottom: 2px solid ${colors.secondary};
            padding-bottom: 10px;
        }
        .slide ul {
            font-size: 1.2em;
            line-height: 1.8;
        }
        .slide li {
            margin: 15px 0;
            padding-left: 10px;
        }
        .slide-number {
            position: absolute;
            top: 10px;
            right: 20px;
            background: ${colors.secondary};
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.9em;
        }
        .title-slide {
            text-align: center;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
        }
        .title-slide h1 {
            color: white;
            font-size: 3em;
            margin-bottom: 20px;
        }
        .notes {
            background: #f8f9fa;
            border-left: 4px solid ${colors.secondary};
            padding: 15px;
            margin-top: 20px;
            font-style: italic;
            color: #666;
        }
        @media print {
            .slide {
                page-break-after: always;
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="presentation">
        <div class="slide title-slide">
            <div class="slide-number">1 / ${slides.length + 1}</div>
            <h1>${title}</h1>
            <p style="font-size: 1.5em;">Présentation générée par Sara LakayAI</p>
            <p style="font-size: 1.2em;">Date: ${new Date().toLocaleDateString("fr-FR")}</p>
        </div>
        
        ${slides
          .map(
            (slide, index) => `
        <div class="slide">
            <div class="slide-number">${index + 2} / ${slides.length + 1}</div>
            <h2>${slide.title}</h2>
            <ul>
                ${slide.content.map((point) => `<li>${point}</li>`).join("")}
            </ul>
            ${slide.notes ? `<div class="notes"><strong>Notes:</strong> ${slide.notes}</div>` : ""}
        </div>
        `,
          )
          .join("")}
    </div>
    
    <script>
        // Navigation avec les flèches du clavier
        document.addEventListener('keydown', function(e) {
            const slides = document.querySelectorAll('.slide');
            let current = 0;
            
            slides.forEach((slide, index) => {
                if (slide.getBoundingClientRect().top >= 0 && slide.getBoundingClientRect().top < window.innerHeight) {
                    current = index;
                }
            });
            
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                if (current < slides.length - 1) {
                    slides[current + 1].scrollIntoView({ behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                if (current > 0) {
                    slides[current - 1].scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    </script>
</body>
</html>`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("🎯 PowerPoint Creator Pro MCP server running on stdio");
  }
}

const server = new PowerPointCreatorProServer();
server.run().catch(console.error);
