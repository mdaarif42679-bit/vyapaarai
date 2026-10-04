import { z } from "zod";
export const num = z.coerce.number().min(0).max(10).catch(7);
export const CampaignSchema = z.object({
  productAnalysis: z.object({ category: z.string(), visualDescription: z.string(), keyFeatures: z.array(z.string()).catch([]), targetAudience: z.string() }),
  strategy: z.object({ marketingAngle: z.string(), campaignType: z.string(), reason: z.string(), offer: z.string(), cta: z.string(), recommendedDirection: z.enum(["VALUE", "QUALITY", "URGENCY"]).catch("VALUE") }),
  content: z.object({ instagramCaption: z.string(), instagramStory: z.string(), whatsappStatus: z.string(), productDescription: z.string(), hashtags: z.array(z.string()).catch([]) }),
  quality: z.object({ audienceFit: num, ctaClarity: num, offerClarity: num, brandConsistency: num, suggestion: z.string() }),
});
export type Campaign = z.infer<typeof CampaignSchema>;
export type Assets = { post: string; story: string; social: string };
export type CampaignResponse = { campaign: Campaign; assets: Assets; publicId: string; direction: string; occasion?: string };
export const BUSINESS_TYPES = ["Clothing", "Restaurant", "Bakery", "Salon", "Jewellery", "Electronics", "Grocery", "Local Service", "Other"];
