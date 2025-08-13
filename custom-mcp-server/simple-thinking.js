#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "simple-thinking",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_step_by_step",
        description: "Analyser un problème ou une tâche étape par étape",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Le sujet à analyser",
            },
            context: {
              type: "string",
              description: "Contexte additionnel (optionnel)",
            },
          },
          required: ["topic"],
        },
      },
      {
        name: "brainstorm_ideas",
        description: "Générer des idées créatives sur un sujet",
        inputSchema: {
          type: "object",
          properties: {
            subject: {
              type: "string",
              description: "Le sujet pour lequel générer des idées",
            },
            num_ideas: {
              type: "number",
              description: "Nombre d'idées à générer (par défaut 5)",
            },
          },
          required: ["subject"],
        },
      },
      {
        name: "pros_cons_analysis",
        description: "Analyser les pour et contre d'une décision",
        inputSchema: {
          type: "object",
          properties: {
            decision: {
              type: "string",
              description: "La décision à analyser",
            },
          },
          required: ["decision"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("Arguments manquants");
  }

  switch (name) {
    case "analyze_step_by_step":
      const topic = args.topic;
      const context = args.context || "";

      return {
        content: [
          {
            type: "text",
            text: `📋 **ANALYSE ÉTAPE PAR ÉTAPE**

**Sujet:** ${topic}
${context ? `**Contexte:** ${context}\n` : ""}

**Étapes d'analyse:**

1. **🎯 Définition du problème**
   - Identifier clairement les enjeux
   - Définir les objectifs à atteindre

2. **🔍 Collecte d'informations**
   - Rassembler les données pertinentes  
   - Identifier les contraintes

3. **💡 Génération de solutions**
   - Brainstormer plusieurs approches
   - Évaluer la faisabilité de chaque option

4. **⚖️ Évaluation des options**
   - Analyser les avantages et inconvénients
   - Considérer les risques et opportunités

5. **✅ Plan d'action**
   - Définir les étapes concrètes
   - Établir un calendrier
   - Identifier les ressources nécessaires

6. **📊 Suivi et ajustement**
   - Mettre en place des indicateurs
   - Prévoir des points de contrôle
   - Rester flexible pour les ajustements`,
          },
        ],
      };

    case "brainstorm_ideas":
      const subject = args.subject;
      const numIdeas = args.num_ideas || 5;

      let ideas = [];
      for (let i = 1; i <= numIdeas; i++) {
        ideas.push(
          `${i}. Idée créative ${i} pour "${subject}" - Approche innovante et pratique`,
        );
      }

      return {
        content: [
          {
            type: "text",
            text: `💡 **BRAINSTORMING CRÉATIF**

**Sujet:** ${subject}

**Idées générées:**
${ideas.join("\n")}

**💭 Techniques de développement:**
• **Approche inversée:** Partir du résultat souhaité et remonter
• **Analogies:** S'inspirer d'autres domaines  
• **Combinaisons:** Fusionner des éléments existants
• **Questions "Et si...":** Explorer des scénarios alternatifs
• **Perspective multiple:** Adopter différents points de vue

**🚀 Prochaines étapes:**
1. Sélectionner les 2-3 idées les plus prometteuses
2. Développer un prototype ou plan détaillé
3. Tester avec un échantillon restreint
4. Itérer et améliorer`,
          },
        ],
      };

    case "pros_cons_analysis":
      const decision = args.decision;

      return {
        content: [
          {
            type: "text",
            text: `⚖️ **ANALYSE POUR/CONTRE**

**Décision à analyser:** ${decision}

**✅ AVANTAGES (POUR):**
• Bénéfice direct et mesurable
• Opportunités de croissance
• Amélioration de l'efficacité
• Réduction des risques actuels
• Alignement avec les objectifs

**❌ INCONVÉNIENTS (CONTRE):**
• Coûts d'implémentation
• Risques potentiels
• Résistance au changement
• Complexité de mise en œuvre
• Opportunités manquées

**🎯 CRITÈRES D'ÉVALUATION:**
• **Impact:** Niveau d'effet sur les objectifs
• **Faisabilité:** Facilité de mise en œuvre
• **Coût:** Ressources nécessaires
• **Timing:** Moment opportun
• **Risque:** Niveau d'incertitude

**💡 RECOMMANDATION:**
Évaluez chaque critère selon votre contexte spécifique et priorisez selon vos objectifs principaux. Considérez aussi les alternatives et options hybrides.`,
          },
        ],
      };

    default:
      throw new Error(`Outil non reconnu: ${name}`);
  }
});

const transport = new StdioServerTransport();
server.connect(transport);

console.error("Simple Thinking MCP Server démarré");
