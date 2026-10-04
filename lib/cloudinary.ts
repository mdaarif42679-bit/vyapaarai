import { v2 as cloudinary } from "cloudinary";
import type { Assets } from "./types";
import { sanitizeHexColor } from "./security";

function cfg() {
  const { CLOUDINARY_CLOUD_NAME: c, CLOUDINARY_API_KEY: k, CLOUDINARY_API_SECRET: s } = process.env;
  if (!c || !k || !s) throw new Error("Cloudinary is not configured. Add credentials to .env.local.");
  cloudinary.config({ cloud_name: c, api_key: k, api_secret: s, secure: true });
}

function cleanOverlayText(str: string, maxLen = 40): string {
  return str
    // Remove characters that conflict with Cloudinary transformation URL delimiters
    .replace(/[,/:%?#&=_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export async function uploadProduct(buf: Buffer): Promise<string> {
  cfg();
  return new Promise((res, rej) =>
    cloudinary.uploader
      .upload_stream({ folder: "vyapaarai", resource_type: "image" }, (e, r) =>
        e || !r ? rej(e ?? new Error("Upload failed")) : res(r.public_id)
      )
      .end(buf)
  );
}

export function buildAssets(publicId: string, business: string, price: string, color: string): Assets {
  cfg();
  const safeColor = sanitizeHexColor(color, "#17162B");
  const hex = safeColor.replace("#", "");
  const safeBusiness = cleanOverlayText(business, 28);
  const safePrice = cleanOverlayText(price, 12);
  const badgeText = `${safeBusiness} | Rs ${safePrice}`;

  const badge = (size: number) => [
    {
      overlay: {
        font_family: "Arial",
        font_size: size,
        font_weight: "bold",
        text: badgeText,
      },
      color: "white",
      background: `rgb:${hex}`,
      gravity: "south",
      y: 40,
      effect: "",
    },
  ];

  const base = (w: number, h: number) => ({ width: w, height: h, crop: "fill", gravity: "auto" });
  const fin = { fetch_format: "auto", quality: "auto" };
  const mk = (w: number, h: number, size: number) =>
    cloudinary.url(publicId, {
      transformation: [base(w, h), { ...badge(size)[0], effect: undefined }, fin] as never,
    });

  return { post: mk(1080, 1080, 48), story: mk(1080, 1920, 56), social: mk(1200, 628, 38) };
}

export const deliveryUrl = (publicId: string) => {
  cfg();
  return cloudinary.url(publicId, {
    transformation: [{ width: 1024, crop: "limit" }, { fetch_format: "jpg", quality: "auto" }],
  });
};
