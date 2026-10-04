import { NextResponse } from "next/server";
import { uploadProduct, buildAssets, deliveryUrl } from "@/lib/cloudinary";
import { generateCampaign } from "@/lib/gemini";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import {
  validateImageMagicBytes,
  sanitizeText,
  sanitizeHexColor,
  isValidPublicId,
} from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;

const REQUIRED = ["business", "product", "price", "type", "audience", "location"];

export async function POST(req: Request) {
  try {
    // 1. IP-based Rate Limiting (Protects API Quota & Cloudinary Storage)
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(ip, 10, 60000); // 10 requests per minute
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Rate limit reached. Please wait ${rateCheck.retryAfterSeconds} seconds before creating another campaign.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
        }
      );
    }

    // 2. Parse and sanitize Form Data
    const fd = await req.formData();
    const raw: Record<string, string> = {};
    fd.forEach((v, k) => {
      if (typeof v === "string") raw[k] = v.trim();
    });

    const missing = REQUIRED.filter((k) => !raw[k]);
    if (missing.length) {
      return NextResponse.json(
        { error: `Please fill in all required fields: ${missing.join(", ")}.` },
        { status: 400 }
      );
    }

    // Sanitize user inputs to prevent prompt injection and malformed strings
    const b: Record<string, string> = {
      business: sanitizeText(raw.business, 80),
      product: sanitizeText(raw.product, 80),
      price: sanitizeText(raw.price, 20),
      type: sanitizeText(raw.type, 40),
      audience: sanitizeText(raw.audience, 80),
      location: sanitizeText(raw.location, 80),
      tone: sanitizeText(raw.tone, 30) || "Friendly",
      color: sanitizeHexColor(raw.color, "#17162B"),
      description: sanitizeText(raw.description, 400),
      direction: sanitizeText(raw.direction, 20),
      occasion: sanitizeText(raw.occasion, 40),
    };

    let publicId = raw.publicId ? raw.publicId.trim() : "";
    let imageMimeType = "image/jpeg";
    let imgBuf: Buffer;

    if (!publicId) {
      // New image upload flow
      const file = fd.get("image");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Please upload a valid product photo." },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Photo size exceeds 10 MB. Please upload a smaller image." },
          { status: 400 }
        );
      }

      imgBuf = Buffer.from(await file.arrayBuffer());

      // 3. Deep Magic-Bytes verification (blocks spoofed SVGs, EXEs, Scripts)
      const magic = validateImageMagicBytes(imgBuf);
      if (!magic.valid) {
        return NextResponse.json(
          {
            error:
              "Unsupported or invalid image file. Only authentic JPG, PNG, and WebP photos are permitted.",
          },
          { status: 400 }
        );
      }
      imageMimeType = magic.mimeType;

      try {
        publicId = await uploadProduct(imgBuf);
      } catch (e) {
        return NextResponse.json(
          { error: `Cloudinary upload failed: ${(e as Error).message}` },
          { status: 502 }
        );
      }
    } else {
      // Re-using existing photo for direction/occasion pivot
      if (!isValidPublicId(publicId)) {
        return NextResponse.json(
          { error: "Invalid product asset identifier." },
          { status: 400 }
        );
      }

      const fetchRes = await fetch(deliveryUrl(publicId));
      if (!fetchRes.ok) {
        return NextResponse.json(
          { error: "Could not retrieve the existing product photo from cloud storage." },
          { status: 502 }
        );
      }
      imgBuf = Buffer.from(await fetchRes.arrayBuffer());
    }

    // 4. Generate AI campaign strategy & content
    const campaign = await generateCampaign(b, imgBuf, imageMimeType).catch((e) => {
      throw Object.assign(e as Error, { status: 502 });
    });

    // 5. Generate branded social assets
    const assets = buildAssets(publicId, b.business, b.price, b.color);
    const direction = b.direction || campaign.strategy.recommendedDirection;
    const occasion = b.occasion || "general";

    return NextResponse.json({
      campaign,
      assets,
      publicId,
      direction,
      occasion,
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return NextResponse.json(
      { error: (e as Error).message || "An unexpected error occurred while creating your campaign." },
      { status }
    );
  }
}

export async function GET() {
  const isGeminiOk = Boolean(process.env.GEMINI_API_KEY);
  const isCloudinaryOk = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

  const ready = isGeminiOk && isCloudinaryOk;

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      services: {
        gemini: isGeminiOk,
        cloudinary: isCloudinaryOk,
      },
    },
    { status: ready ? 200 : 503 }
  );
}
