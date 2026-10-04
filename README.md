# VyapaarAI — One Product Photo. Complete Marketing Campaign.
Small businesses upload one product photo plus basic details; VyapaarAI makes a marketing *decision* (audience, angle, offer, CTA, reasoning), writes the content, and builds platform-ready media.

**Workflow:** Upload → Cloudinary → Gemini (analysis + strategy + copy + self-scored quality) → Cloudinary transformations → dashboard.

## Why Cloudinary is essential
Every photo is uploaded to Cloudinary, which then generates the 1:1 Instagram post, 9:16 story and 1200×628 WhatsApp/social variants on the fly: smart `g_auto` cropping, `f_auto`/`q_auto` optimization, and a brand-colored name/price overlay. Gemini also reads the optimized Cloudinary image when you regenerate. Without it, there are no platform-ready assets.

## Stack
Next.js 14 (App Router), TypeScript, Zod validation, Gemini REST API (model set by `GEMINI_MODEL`), Cloudinary Node SDK. Secrets stay server-side in `/api/campaign`.

## Setup
```
npm install
cp .env.example .env.local   # fill in Gemini + Cloudinary keys
npm run dev                  # http://localhost:3001
```
Deploy on Vercel: import the repo and add the same env vars.

## Demo
Defaults are pre-filled (Aarif Fashion, Men's Casual Shirt, ₹599, Clothing, College students, Bhilai). Upload a shirt photo, click Generate Campaign, then switch VALUE / QUALITY / URGENCY or try an occasion.

## Notes
Nothing auto-posts to Instagram/WhatsApp: copy and download only. No auth or database by design. Brand profile is the form's name/tone/location/color (logo upload and saved profiles are future work).
