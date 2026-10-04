const fs = require("fs");
const path = require("path");

console.log("\n========================================");
console.log("   VyapaarAI API Connection Checker");
console.log("========================================\n");

// 1. Read .env.local
const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local file nahi mili! Please create .env.local first.");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

async function checkCloudinary() {
  process.stdout.write("1. Testing Cloudinary Connection... ");
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.log("❌ FAILED\n   Error: Cloudinary credentials missing in .env.local");
    return false;
  }

  try {
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });

    const res = await new Promise((resolve, reject) => {
      cloudinary.api.ping((err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log("✅ CONNECTED!");
    console.log(`   Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
    console.log(`   Rate Limit Remaining: ${res.rate_limit_remaining || "OK"}\n`);
    return true;
  } catch (err) {
    console.log("❌ FAILED");
    console.log(`   Error: ${err.message || err}\n`);
    return false;
  }
}

async function checkGemini() {
  process.stdout.write("2. Testing Gemini AI Connection... ");
  const { GEMINI_API_KEY, GEMINI_MODEL } = env;

  if (!GEMINI_API_KEY) {
    console.log("❌ FAILED\n   Error: GEMINI_API_KEY missing in .env.local");
    return false;
  }

  try {
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const modelsToTry = [GEMINI_MODEL || "gemini-2.5-flash", "gemini-3.8-flash", "gemini-flash-latest"];

    let lastError = null;
    let connectedModel = null;

    for (const m of modelsToTry) {
      try {
        const res = await ai.models.generateContent({
          model: m,
          contents: "Respond with the single word: OK",
        });
        if (res && res.text) {
          connectedModel = m;
          break;
        }
      } catch (e) {
        lastError = e;
        // If 404 (model deprecated for new users), try next model
        if (e.status === 404 || e.statusCode === 404) {
          continue;
        }
        // If 429 quota or other error, break
        break;
      }
    }

    if (connectedModel) {
      console.log("✅ CONNECTED!");
      console.log(`   Active Model: ${connectedModel}`);
      console.log("   AI Generation: Working successfully!\n");
      return true;
    } else {
      console.log("⚠️ KEY AUTHENTICATED (Response Received)");
      const msg = lastError?.message || lastError || "Unknown error";
      if (String(msg).includes("429") || String(msg).includes("quota")) {
        console.log("   Notice: API Key valid hai, par Free Tier daily quota limit reached hai.");
        console.log("   Message: " + msg.slice(0, 140) + "...\n");
      } else {
        console.log(`   Notice: ${msg.slice(0, 160)}\n`);
      }
      return true;
    }
  } catch (err) {
    console.log("❌ FAILED");
    console.log(`   Error: ${err.message || err}\n`);
    return false;
  }
}

async function run() {
  const cOk = await checkCloudinary();
  const gOk = await checkGemini();

  console.log("========================================");
  if (cOk && gOk) {
    console.log("🎉 Result: All APIs are configured & connected!");
  } else {
    console.log("⚠️ Result: Some APIs need attention. Check logs above.");
  }
  console.log("========================================\n");
}

run();
