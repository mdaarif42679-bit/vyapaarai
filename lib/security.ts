/**
 * Security helper utilities for VyapaarAI
 * Provides input sanitization, magic-byte image validation, and pattern checks.
 */

// Safe image magic bytes verification
export function validateImageMagicBytes(buf: Buffer): { valid: boolean; mimeType: string } {
  if (!buf || buf.length < 12) {
    return { valid: false, mimeType: "" };
  }

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { valid: true, mimeType: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { valid: true, mimeType: "image/png" };
  }

  // WebP: RIFF [4 bytes length] WEBP
  const isRiff = buf.subarray(0, 4).toString("ascii") === "RIFF";
  const isWebp = buf.subarray(8, 12).toString("ascii") === "WEBP";
  if (isRiff && isWebp) {
    return { valid: true, mimeType: "image/webp" };
  }

  return { valid: false, mimeType: "" };
}

// Sanitize user text inputs to prevent prompt injection and markup corruption
export function sanitizeText(input: unknown, maxLength = 80): string {
  if (typeof input !== "string") return "";

  return input
    // Remove control characters and non-printable characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Remove triple backticks or markdown fences that confuse LLMs
    .replace(/```/g, "")
    // Remove HTML tags
    .replace(/<[^>]*>?/gm, "")
    // Trim whitespace
    .trim()
    .slice(0, maxLength);
}

// Validate Cloudinary public ID pattern to prevent SSRF / URL manipulation
export function isValidPublicId(publicId: string): boolean {
  return /^vyapaarai\/[a-zA-Z0-9_\-\/]+$/.test(publicId);
}

// Validate Hex Color format
export function sanitizeHexColor(color: unknown, defaultColor = "#17162B"): string {
  if (typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color.trim())) {
    return color.trim();
  }
  return defaultColor;
}
