import { GoogleGenAI } from "@google/genai";
import { CampaignSchema, type Campaign } from "./types";

export type Brief = Record<string, string>;

const prompt = (b: Brief) => {
  const dirGuidance =
    b.direction === "VALUE"
      ? 'CAMPAIGN DIRECTION MANDATE: VALUE. Emphasize affordability, price-to-value ratio, discounts, budget-friendliness, and smart spending. Set strategy.recommendedDirection to "VALUE".'
      : b.direction === "QUALITY"
      ? 'CAMPAIGN DIRECTION MANDATE: QUALITY. Emphasize craftsmanship, premium materials, high durability, trust, and luxury feel. Set strategy.recommendedDirection to "QUALITY".'
      : b.direction === "URGENCY"
      ? 'CAMPAIGN DIRECTION MANDATE: URGENCY. Emphasize FOMO, limited stock, fast-expiring offer, act now, and countdown urgency. Set strategy.recommendedDirection to "URGENCY".'
      : 'Choose the single best marketing direction among VALUE, QUALITY, or URGENCY based on product and pricing.';

  const occasionGuidance =
    b.occasion && b.occasion !== "general"
      ? `CAMPAIGN OCCASION MANDATE: "${b.occasion}". Weave this specific occasion directly into the hooks, story, and call to action (e.g. Product Launch: exclusive first look & hype; Weekend Offer: weekend shopping & limited window; Festival Promotion: festive gifting, celebration & joy; Clearance Sale: last chance stock clearance & steep drops).`
      : "Campaign occasion: General promotion.";

  return `You are VyapaarAI's marketing brain for small Indian businesses. Look at the product photo and make a MARKETING DECISION, not just a caption.
Business: ${b.business} (${b.type}) in ${b.location}. Brand tone: ${b.tone}. About: ${b.description || "n/a"}.
Product: ${b.product} priced Rs ${b.price}. Intended audience: ${b.audience}.
${dirGuidance}
${occasionGuidance}
Adapt messaging to the business type (clothing: style+price+trend; restaurant: taste+offer+location; salon: transformation+booking; bakery: freshness+occasion+order).
Use the rupee symbol (₹) in copy. Score quality fields 0-10 honestly, critiquing your own campaign.
Return ONLY JSON: {"productAnalysis":{"category","visualDescription","keyFeatures":[],"targetAudience"},"strategy":{"marketingAngle","campaignType","reason","offer","cta","recommendedDirection":"VALUE|QUALITY|URGENCY"},"content":{"instagramCaption","instagramStory","whatsappStatus","productDescription","hashtags":[]},"quality":{"audienceFit","ctaClarity","offerClarity","brandConsistency","suggestion"}}`;
};

export async function generateCampaign(b: Brief, img: Buffer, mimeType = "image/jpeg"): Promise<Campaign> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini is not configured. Add GEMINI_API_KEY to .env.local.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey: key });
  const models = [...new Set([model, "gemini-3.8-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"])];
  let lastError = "Gemini did not return a campaign.";

  for (const candidate of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let interaction;
      try {
        interaction = await ai.interactions.create({
          model: candidate,
          input: [
            { type: "text", text: prompt(b) },
            { type: "image", mime_type: mimeType, data: img.toString("base64") },
          ],
          generation_config: { temperature: 0.8 },
          response_format: { type: "text", mime_type: "application/json" },
          store: false,
        });
      } catch (e) {
        const error = e as { status?: number; statusCode?: number; message?: string };
        const status = error.status || error.statusCode;
        lastError = status
          ? `Gemini request failed (${status}): ${(error.message || "Request failed.").slice(0, 500)}`
          : error.message || "Gemini request failed.";

        // Allow retry / next candidate on 404 (deprecated model), 429 (rate limit), or 5xx server errors
        if (status && ![404, 429, 500, 502, 503, 504].includes(status)) {
          throw new Error(lastError);
        }
      }

      if (interaction) {
        try {
          const text = interaction.output_text?.replace(/```json|```/g, "").trim();
          if (!text) throw new Error("Gemini returned an empty campaign.");
          return CampaignSchema.parse(JSON.parse(text));
        } catch {
          lastError = "The AI returned an unreadable campaign.";
        }
      }

      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error(lastError);
}
