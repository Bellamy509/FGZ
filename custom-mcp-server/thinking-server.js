#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
// Serveur MCP custom pour la réflexion et l'analyse
const server = new Server(
  {
    name: "thinking-assistant",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);
// Outil pour analyser et réfléchir sur un problème
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_problem",
        description:
          "Analyser un problème de manière structurée et proposer des solutions",
        inputSchema: {
          type: "object",
          properties: {
            problem: {
              type: "string",
              description: "Le problème à analyser",
            },
            context: {
              type: "string",
              description: "Contexte supplémentaire (optionnel)",
            },
          },
          required: ["problem"],
        },
      },
      {
        name: "step_by_step_thinking",
        description: "Décomposer une tâche complexe en étapes logiques",
        inputSchema: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: "La tâche à décomposer",
            },
            goal: {
              type: "string",
              description: "L'objectif final",
            },
          },
          required: ["task"],
        },
      },
      {
        name: "pros_and_cons",
        description: "Analyser les avantages et inconvénients d'une décision",
        inputSchema: {
          type: "object",
          properties: {
            decision: {
              type: "string",
              description: "La décision à analyser",
            },
            criteria: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Critères d'évaluation (optionnel)",
            },
          },
          required: ["decision"],
        },
      },
      {
        name: "creative_brainstorm",
        description: "Générer des idées créatives pour un sujet donné",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Le sujet pour le brainstorming",
            },
            quantity: {
              type: "number",
              description: "Nombre d'idées à générer (défaut: 5)",
            },
          },
          required: ["topic"],
        },
      },
    ],
  };
});
// Gestion des appels d'outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  switch (name) {
    case "analyze_problem":
      const problem = args.problem;
      const context = args.context || "";
      const analysis = `
🔍 **ANALYSE DU PROBLÈME**

**Problème identifié:**
${problem}

${context ? `**Contexte:**\n${context}\n` : ""}

**Analyse structurée:**
1. **Nature du problème:** ${categorizeeProblem(problem)}
2. **Causes possibles:** ${getPossibleCauses(problem)}
3. **Impact:** ${assessImpact(problem)}
4. **Urgence:** ${assessUrgency(problem)}

**Solutions recommandées:**
${generateSolutions(problem)}

**Prochaines étapes:**
${getNextSteps(problem)}
      `;
      return {
        content: [
          {
            type: "text",
            text: analysis,
          },
        ],
      };
    case "step_by_step_thinking":
      const task = args.task;
      const goal = args.goal || "Accomplir la tâche";
      const steps = `
📋 **DÉCOMPOSITION ÉTAPE PAR ÉTAPE**

**Tâche:** ${task}
**Objectif:** ${goal}

**Plan d'action:**
${generateSteps(task, goal)}

**Points de contrôle:**
${generateCheckpoints(task)}

**Ressources nécessaires:**
${identifyResources(task)}
      `;
      return {
        content: [
          {
            type: "text",
            text: steps,
          },
        ],
      };
    case "pros_and_cons":
      const decision = args.decision;
      const criteria = args.criteria || [];
      const analysis_pc = `
⚖️ **ANALYSE AVANTAGES/INCONVÉNIENTS**

**Décision:** ${decision}

**✅ AVANTAGES:**
${generatePros(decision)}

**❌ INCONVÉNIENTS:**
${generateCons(decision)}

${criteria.length > 0 ? `**📊 ÉVALUATION SELON VOS CRITÈRES:**\n${evaluateByCriteria(decision, criteria)}` : ""}

**🎯 RECOMMANDATION:**
${makeRecommendation(decision)}
      `;
      return {
        content: [
          {
            type: "text",
            text: analysis_pc,
          },
        ],
      };
    case "creative_brainstorm":
      const topic = args.topic;
      const quantity = args.quantity || 5;
      const ideas = `
💡 **BRAINSTORMING CRÉATIF**

**Sujet:** ${topic}

**Idées générées:**
${generateCreativeIdeas(topic, quantity)}

**Idées bonus (approches différentes):**
${generateAlternativeApproaches(topic)}

**Conseils pour développer ces idées:**
${getImplementationTips(topic)}
      `;
      return {
        content: [
          {
            type: "text",
            text: ideas,
          },
        ],
      };
    default:
      throw new Error(`Outil inconnu: ${name}`);
  }
});
// Fonctions utilitaires
function categorizeeProblem(problem) {
  if (problem.toLowerCase().includes("technique")) return "Problème technique";
  if (problem.toLowerCase().includes("communication"))
    return "Problème de communication";
  if (problem.toLowerCase().includes("organisation"))
    return "Problème organisationnel";
  return "Problème général nécessitant une analyse approfondie";
}
function getPossibleCauses(_problem) {
  return `
• Facteurs techniques ou systémiques
• Manque d'informations ou de ressources
• Problèmes de communication ou coordination
• Contraintes de temps ou de budget
• Facteurs externes imprévisibles`;
}
function assessImpact(_problem) {
  return "Impact à évaluer selon votre contexte spécifique";
}
function assessUrgency(_problem) {
  return "Urgence à déterminer selon vos priorités";
}
function generateSolutions(_problem) {
  return `
1. **Solution immédiate:** Action directe pour résoudre rapidement
2. **Solution à moyen terme:** Approche progressive et planifiée
3. **Solution préventive:** Mesures pour éviter la récurrence
4. **Solution alternative:** Approche créative ou contournement`;
}
function getNextSteps(_problem) {
  return `
1. Valider l'analyse avec les parties prenantes
2. Prioriser les solutions selon vos ressources
3. Établir un plan d'action avec échéances
4. Mettre en place des indicateurs de suivi`;
}
function generateSteps(_task, _goal) {
  return `
1. **Préparation:** Rassembler les informations et ressources nécessaires
2. **Planification:** Définir l'approche et les jalons
3. **Exécution:** Mettre en œuvre les actions planifiées
4. **Contrôle:** Vérifier la progression et ajuster si nécessaire
5. **Finalisation:** Compléter la tâche et valider l'atteinte de l'objectif`;
}
function generateCheckpoints(_task) {
  return `
• Point de contrôle 25% : Validation de la préparation
• Point de contrôle 50% : Évaluation de la progression
• Point de contrôle 75% : Ajustements et optimisations
• Point de contrôle 100% : Validation finale et livrables`;
}
function identifyResources(_task) {
  return `
• **Humaines:** Compétences et disponibilité des personnes
• **Matérielles:** Outils, équipements, infrastructure
• **Informationnelles:** Documentation, données, connaissances
• **Temporelles:** Délais et planning
• **Financières:** Budget et coûts associés`;
}
function generatePros(_decision) {
  return `
• Avantage potentiel 1 : Bénéfice direct identifiable
• Avantage potentiel 2 : Impact positif à long terme
• Avantage potentiel 3 : Opportunités créées
• Avantage potentiel 4 : Risques évités ou réduits`;
}
function generateCons(_decision) {
  return `
• Inconvénient potentiel 1 : Coûts ou efforts requis
• Inconvénient potentiel 2 : Risques associés
• Inconvénient potentiel 3 : Opportunités manquées
• Inconvénient potentiel 4 : Complications possibles`;
}
function evaluateByCriteria(_decision, criteria) {
  return criteria
    .map((criterion) => `• **${criterion}:** Évaluation selon ce critère`)
    .join("\n");
}
function makeRecommendation(_decision) {
  return "Sur la base de cette analyse, évaluez les facteurs les plus importants pour votre situation spécifique avant de prendre une décision finale.";
}
function generateCreativeIdeas(topic, quantity) {
  const ideas = [];
  for (let i = 1; i <= quantity; i++) {
    ideas.push(`${i}. Idée créative ${i} : Approche innovante pour ${topic}`);
  }
  return ideas.join("\n");
}
function generateAlternativeApproaches(_topic) {
  return `
• **Approche inverse:** Partir de la fin et remonter vers le début
• **Approche collaborative:** Impliquer d'autres perspectives
• **Approche minimale:** Version simplifiée pour tester rapidement
• **Approche disruptive:** Remettre en question les suppositions de base`;
}
function getImplementationTips(_topic) {
  return `
• Commencer petit et itérer rapidement
• Obtenir des retours d'expérience précoces
• Documenter le processus et les apprentissages
• Rester flexible et adaptable aux changements`;
}
// Démarrage du serveur
const transport = new StdioServerTransport();
server.connect(transport);
console.error("Thinking Assistant MCP Server running on stdio");
