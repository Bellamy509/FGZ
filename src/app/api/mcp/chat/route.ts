import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getSession } from "auth/server";
import { deductUserCredits } from "@/lib/db/repository";
import { pgUserCreditsRepository } from "@/lib/db/pg/repositories/user-repository.pg";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Get user credits before processing
    const userCredit = await pgUserCreditsRepository.getUserCredits(userId);
    if (!userCredit || userCredit.credits <= 0) {
      return new Response(
        JSON.stringify({
          error:
            "Insufficient credits. Please upgrade your plan or contact support.",
          needsUpgrade: true,
        }),
        {
          status: 402,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { messages, selectedModel } = await request.json();

    // Pour l'instant, utilisons OpenAI avec un prompt spécial pour MCP
    // Plus tard, nous intégrerons les vrais outils MCP
    const result = await streamText({
      model: openai(selectedModel || "gpt-3.5-turbo"),
      messages: [
        {
          role: "system",
          content: `Tu es un assistant MCP (Model Context Protocol) qui peut se connecter à plus de 2700+ APIs et services externes.

Tu peux aider avec:
- 📧 Communication: Gmail, Outlook, Slack, Discord
- 📅 Productivité: Google Calendar, Notion, Trello, Asana  
- 💳 Business: Stripe, HubSpot, Salesforce, Shopify
- 🔧 Développement: GitHub, GitLab, Docker, AWS
- 📊 Analytics: Google Analytics, Mixpanel, Segment
- 🛒 E-commerce: Shopify, WooCommerce, Magento

Quand un utilisateur demande d'utiliser une API spécifique, explique comment tu pourrais l'aider avec cette API et demande des détails spécifiques pour l'action souhaitée.

Exemple de réponse:
"Je peux t'aider avec Gmail ! Je peux:
- Lire tes emails récents
- Envoyer de nouveaux emails
- Rechercher des emails spécifiques
- Organiser ta boîte de réception

Que souhaites-tu faire exactement avec Gmail ?"

Sois toujours enthousiaste et utile. Actuellement en mode démo - les vraies connexions API seront bientôt disponibles.`,
        },
        ...messages,
      ],
      onFinish: async ({ usage }) => {
        // Deduct credits based on token usage
        try {
          if (usage && usage.totalTokens > 0) {
            const deductedCredits = await deductUserCredits(
              userId,
              usage.totalTokens,
            );

            console.log(
              `MCP Simple Chat - Credits deducted for user ${userId}: ${deductedCredits} credits (${usage.totalTokens} tokens)`,
            );
          } else {
            console.warn(
              "MCP Simple Chat - No usage information available for credit deduction",
            );
          }
        } catch (error) {
          console.error("MCP Simple Chat - Error deducting credits:", error);
          // Don't throw here to avoid breaking the chat flow
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("MCP Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
