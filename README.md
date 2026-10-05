# VyapaarAI — One Product Photo. Complete Marketing Campaign.

Small businesses upload one product photo plus basic details; VyapaarAI makes a marketing *decision* (audience, angle, offer, CTA, reasoning), writes the content, and builds platform-ready media.

## 🚀 Live Demo

https://vyapaarai-p63c5bnn9-mdaarif42679-bits-projects.vercel.app

**Workflow:** Upload → Cloudinary → Gemini (analysis + strategy + copy + self-scored quality) → Cloudinary transformations → dashboard.

## Why Cloudinary is essential

Every photo is uploaded to Cloudinary, which then generates the 1:1 Instagram post, 9:16 story and 1200×628 WhatsApp/social variants on the fly: smart `g_auto` cropping, `f_auto`/`q_auto` optimization, and a brand-colored name/price overlay. Gemini also reads the optimized Cloudinary image when you regenerate. Without it, there are no platform-ready assets.

## Stack

Next.js 14 (App Router), TypeScript, Zod validation, Gemini REST API (model set by `GEMINI_MODEL`), Cloudinary Node SDK. Secrets stay server-side in `/api/campaign`.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Gemini + Cloudinary keys
npm run dev                  # http://localhost:3001
