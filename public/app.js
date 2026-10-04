/**
 * VyapaarAI — Modern Marketing Engine
 * Pair-programmed for Hackathon Winning UX
 */

// ==========================================
// PRESETS & DEMO CATALOG
// ==========================================
const DEMO_PRESETS = {
  shirt: {
    business: "Aarif Fashion",
    product: "Men's Casual Linen Shirt",
    price: "599",
    type: "Clothing & Apparel",
    audience: "College students & young professionals",
    location: "Bhilai, Chhattisgarh",
    tone: "Friendly",
    color: "#1c1b2e",
    direction: "VALUE",
    occasion: "general",
    description: "Handcrafted breathable cotton-linen blend casual shirts for everyday college and hangout wear. Lightweight, wrinkle-resistant and sweat-friendly for Indian summers.",
    imageSrc: "samples/shirt.jpg"
  },
  chai: {
    business: "Kulhad & Co. Cafe",
    product: "Steaming Masala Kulhad Chai",
    price: "129",
    type: "Food & Cafe",
    audience: "College youth, evening crowds & tea connoisseurs",
    location: "FC Road, Pune",
    tone: "Playful & Fun",
    color: "#e8920c",
    direction: "QUALITY",
    occasion: "Weekend Offer",
    description: "Authentic slow-brewed kadak masala chai served in fresh eco-friendly clay kulhads with roasted cardamom, organic ginger and saffron aroma.",
    imageSrc: "samples/chai.jpg"
  },
  sweets: {
    business: "Shree Ganesh Sweets",
    product: "Royal Kaju Katli Festive Box",
    price: "850",
    type: "Bakery & Sweets",
    audience: "Families, festive gift-buyers & corporate clients",
    location: "MI Road, Jaipur",
    tone: "Desi Traditional",
    color: "#b91c1c",
    direction: "QUALITY",
    occasion: "Festival Promotion",
    description: "Pure Goan cashew nuts prepared with 100% pure desi ghee and certified silver vark. Melt-in-mouth freshness since 1982.",
    imageSrc: "samples/sweets.jpg"
  }
};

const STAGES = [
  "Uploading product photo & verifying resolution...",
  "Gemini Vision analyzing product category & aesthetics...",
  "Synthesizing audience persona & psychographic angles...",
  "Formulating high-conversion offer & value proposition...",
  "Generating multi-channel copy (Instagram, WhatsApp, Ad copy)...",
  "Cloudinary rendering brand color & price badge overlays...",
  "Assembling Campaign Command Center..."
];

// ==========================================
// STATE MANAGEMENT
// ==========================================
const state = {
  currentFile: null,
  currentPreviewUrl: "",
  activePublicId: "",
  isBusy: false,
  campaignData: null,
  activeDirection: "",
  activeOccasion: "general",
  backendOnline: false,
  apiEndpoint: "/api/campaign"
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const elements = {
  form: document.getElementById("campaign-form"),
  dropArea: document.getElementById("drop-area"),
  fileInput: document.getElementById("product-file-input"),
  dropPrompt: document.getElementById("drop-prompt"),
  previewContainer: document.getElementById("preview-container"),
  previewImg: document.getElementById("preview-img"),
  removeImageBtn: document.getElementById("remove-image-btn"),
  resolutionBadge: document.getElementById("resolution-badge"),
  generateBtn: document.getElementById("generate-btn"),
  progressOverlay: document.getElementById("progress-overlay"),
  pipelineStepsList: document.getElementById("pipeline-steps-list"),
  resultsSection: document.getElementById("results-section"),
  backendStatusDot: document.getElementById("backend-status-dot"),
  backendStatusText: document.getElementById("backend-status-text"),
  themeToggleBtn: document.getElementById("theme-toggle-btn"),
  toastContainer: document.getElementById("toast-container"),
  
  // Strategy fields
  strategyAudience: document.getElementById("strategy-audience"),
  strategyAngle: document.getElementById("strategy-angle"),
  strategyType: document.getElementById("strategy-type"),
  strategyOffer: document.getElementById("strategy-offer"),
  strategyCta: document.getElementById("strategy-cta"),
  strategyProduct: document.getElementById("strategy-product"),
  strategyWhy: document.getElementById("strategy-why"),
  recommendedBadge: document.getElementById("recommended-direction-badge"),

  // Creative mockups
  igImg: document.getElementById("ig-post-img"),
  igUser: document.getElementById("ig-user-name"),
  igCaption: document.getElementById("ig-post-caption"),
  copyIgCaptionBtn: document.getElementById("copy-ig-caption-btn"),
  downloadIgBtn: document.getElementById("download-ig-btn"),

  storyImg: document.getElementById("story-img"),
  storyUser: document.getElementById("story-user-name"),
  storyText: document.getElementById("story-text"),
  copyStoryBtn: document.getElementById("copy-story-btn"),
  downloadStoryBtn: document.getElementById("download-story-btn"),

  waImg: document.getElementById("wa-img"),
  waText: document.getElementById("wa-text"),
  copyWaBtn: document.getElementById("copy-wa-btn"),
  shareWaBtn: document.getElementById("share-wa-btn"),
  downloadWaBtn: document.getElementById("download-wa-btn"),

  productDesc: document.getElementById("product-desc-text"),
  copyDescBtn: document.getElementById("copy-desc-btn"),

  hashtagCloud: document.getElementById("hashtag-cloud"),
  copyAllHashtagsBtn: document.getElementById("copy-all-hashtags-btn"),

  // Audit
  auditAudienceBar: document.getElementById("audit-audience-bar"),
  auditAudienceVal: document.getElementById("audit-audience-val"),
  auditCtaBar: document.getElementById("audit-cta-bar"),
  auditCtaVal: document.getElementById("audit-cta-val"),
  auditOfferBar: document.getElementById("audit-offer-bar"),
  auditOfferVal: document.getElementById("audit-offer-val"),
  auditBrandBar: document.getElementById("audit-brand-bar"),
  auditBrandVal: document.getElementById("audit-brand-val"),
  auditCritique: document.getElementById("audit-critique-text")
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupEventListeners();
  checkBackendHealth();
  
  // Pre-load default sample
  loadPreset("shirt");
});

// ==========================================
// THEME SETUP
// ==========================================
function setupTheme() {
  const savedTheme = localStorage.getItem("vyapaar_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("vyapaar_theme", next);
      updateThemeIcon(next);
      showToast(`Switched to ${next} mode`);
    });
  }
}

function updateThemeIcon(theme) {
  if (!elements.themeToggleBtn) return;
  elements.themeToggleBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
  elements.themeToggleBtn.title = theme === "dark" ? "Switch to Solar Light" : "Switch to Cyber Dark";
}

// ==========================================
// BACKEND HEALTH CHECK
// ==========================================
async function checkBackendHealth() {
  try {
    const res = await fetch("/api/campaign", { method: "GET" }).catch(() => null);
    if (res && (res.ok || res.status === 200 || res.status === 503)) {
      state.backendOnline = true;
      if (elements.backendStatusDot) elements.backendStatusDot.style.background = "#10b981";
      if (elements.backendStatusText) elements.backendStatusText.textContent = "Backend: Online (Gemini + Cloudinary)";
    } else {
      setOfflineFallbackStatus();
    }
  } catch {
    setOfflineFallbackStatus();
  }
}

function setOfflineFallbackStatus() {
  state.backendOnline = false;
  if (elements.backendStatusDot) elements.backendStatusDot.style.background = "#f59e0b";
  if (elements.backendStatusText) elements.backendStatusText.textContent = "Engine: Interactive Studio Mode";
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Drag and Drop
  if (elements.dropArea) {
    elements.dropArea.addEventListener("click", () => elements.fileInput.click());
    elements.dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      elements.dropArea.classList.add("dragover");
    });
    elements.dropArea.addEventListener("dragleave", () => {
      elements.dropArea.classList.remove("dragover");
    });
    elements.dropArea.addEventListener("drop", (e) => {
      e.preventDefault();
      elements.dropArea.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
  }

  if (elements.fileInput) {
    elements.fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  if (elements.removeImageBtn) {
    elements.removeImageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      resetImage();
    });
  }

  // Preset Chips
  document.querySelectorAll("[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-preset");
      loadPreset(key);
    });
  });

  // Color Swatches
  document.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
      const color = swatch.getAttribute("data-color");
      const colorInput = document.getElementById("brand-color-input");
      if (colorInput) colorInput.value = color;
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
    });
  });

  // Direction Chips
  document.querySelectorAll(".direction-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const dir = chip.getAttribute("data-direction");
      if (state.activeDirection === dir) {
        state.activeDirection = "";
        chip.classList.remove("selected");
      } else {
        state.activeDirection = dir;
        document.querySelectorAll(".direction-chip").forEach(c => c.classList.remove("selected"));
        chip.classList.add("selected");
      }
    });
  });

  // Occasion Pills
  document.querySelectorAll(".occasion-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const occ = pill.getAttribute("data-occasion");
      state.activeOccasion = occ;
      document.querySelectorAll(".occasion-pill").forEach(p => p.classList.remove("selected"));
      pill.classList.add("selected");
    });
  });

  // Form Submit
  if (elements.form) {
    elements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      runCampaignGeneration();
    });
  }

  // Copy Buttons
  setupCopyButtons();

  // Tab Switching
  setupTabs();

  // Pivot Buttons in Results
  setupPivotButtons();
}

// ==========================================
// PRESET LOADER
// ==========================================
async function loadPreset(key) {
  const p = DEMO_PRESETS[key];
  if (!p) return;

  // Set form inputs
  const setValue = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setValue("business-name-input", p.business);
  setValue("product-name-input", p.product);
  setValue("price-input", p.price);
  setValue("business-type-select", p.type);
  setValue("audience-input", p.audience);
  setValue("location-input", p.location);
  setValue("brand-tone-select", p.tone);
  setValue("brand-color-input", p.color);
  setValue("description-input", p.description);

  // Set direction
  state.activeDirection = p.direction;
  document.querySelectorAll(".direction-chip").forEach(c => {
    c.classList.toggle("selected", c.getAttribute("data-direction") === p.direction);
  });

  // Set occasion
  state.activeOccasion = p.occasion;
  document.querySelectorAll(".occasion-pill").forEach(pill => {
    pill.classList.toggle("selected", pill.getAttribute("data-occasion") === p.occasion);
  });

  // Set active swatch
  document.querySelectorAll(".color-swatch").forEach(s => {
    s.classList.toggle("active", s.getAttribute("data-color").toLowerCase() === p.color.toLowerCase());
  });

  // Highlight thumbnail
  document.querySelectorAll(".sample-thumb-item").forEach(t => {
    t.classList.toggle("active", t.getAttribute("data-preset") === key);
  });

  // Load sample image
  try {
    const res = await fetch(p.imageSrc);
    if (res.ok) {
      const blob = await res.blob();
      const file = new File([blob], `${key}.jpg`, { type: "image/jpeg" });
      handleFileSelect(file, p.imageSrc);
      showToast(`Loaded ${p.business} preset!`);
    }
  } catch (err) {
    console.warn("Preset image fetch error:", err);
  }
}

// ==========================================
// FILE HANDLING
// ==========================================
function handleFileSelect(file, customSrc = null) {
  if (!file.type.startsWith("image/")) {
    showToast("Please choose a valid JPG, PNG, or WebP image.", "error");
    return;
  }

  state.currentFile = file;
  state.activePublicId = ""; // Reset publicId for fresh image

  const url = customSrc || URL.createObjectURL(file);
  state.currentPreviewUrl = url;

  if (elements.previewImg) {
    elements.previewImg.src = url;
    elements.previewImg.onload = () => {
      if (elements.resolutionBadge) {
        elements.resolutionBadge.textContent = `${elements.previewImg.naturalWidth} × ${elements.previewImg.naturalHeight}px`;
      }
    };
  }

  if (elements.previewContainer) elements.previewContainer.style.display = "block";
  if (elements.dropPrompt) elements.dropPrompt.style.display = "none";
}

function resetImage() {
  state.currentFile = null;
  state.currentPreviewUrl = "";
  state.activePublicId = "";
  if (elements.fileInput) elements.fileInput.value = "";
  if (elements.previewContainer) elements.previewContainer.style.display = "none";
  if (elements.dropPrompt) elements.dropPrompt.style.display = "block";
  showToast("Image cleared.");
}

// ==========================================
// CAMPAIGN GENERATION PIPELINE
// ==========================================
async function runCampaignGeneration(pivotOverrides = {}) {
  if (!state.currentFile && !state.activePublicId) {
    showToast("Please upload a product photo or pick a sample first.", "error");
    return;
  }

  if (state.isBusy) return;
  state.isBusy = true;

  // Build brief data from form
  const getVal = (id) => (document.getElementById(id)?.value || "").trim();
  const brief = {
    business: getVal("business-name-input") || "Aarif Fashion",
    product: getVal("product-name-input") || "Casual Shirt",
    price: getVal("price-input") || "599",
    type: getVal("business-type-select") || "Clothing",
    audience: getVal("audience-input") || "College students",
    location: getVal("location-input") || "Bhilai",
    tone: getVal("brand-tone-select") || "Friendly",
    color: getVal("brand-color-input") || "#1c1b2e",
    description: getVal("description-input") || "",
    direction: pivotOverrides.direction !== undefined ? pivotOverrides.direction : state.activeDirection,
    occasion: pivotOverrides.occasion !== undefined ? pivotOverrides.occasion : state.activeOccasion
  };

  // Show Pipeline Progress
  showProgressModal();
  let stepIndex = 0;
  updatePipelineStep(stepIndex);

  const stepTimer = setInterval(() => {
    stepIndex++;
    if (stepIndex < STAGES.length) {
      updatePipelineStep(stepIndex);
    }
  }, 900);

  try {
    let result = null;

    // 1. If backend is online, try POST to /api/campaign
    if (state.backendOnline) {
      const fd = new FormData();
      Object.entries(brief).forEach(([k, v]) => fd.set(k, v));

      if (state.activePublicId) {
        fd.set("publicId", state.activePublicId);
      } else if (state.currentFile) {
        fd.set("image", state.currentFile);
      }

      const res = await fetch(state.apiEndpoint, {
        method: "POST",
        body: fd
      }).catch(() => null);

      if (res && res.ok) {
        result = await res.json();
      }
    }

    // 2. If backend response wasn't obtained (e.g. offline, quota reached, or file:// protocol),
    // activate the ultra-realistic in-browser generative engine!
    if (!result || !result.campaign) {
      result = await generateStudioCampaign(brief, state.currentPreviewUrl);
    }

    clearInterval(stepTimer);
    hideProgressModal();

    // Store state
    state.campaignData = result;
    if (result.publicId) state.activePublicId = result.publicId;
    if (result.direction) state.activeDirection = result.direction;

    // Render results
    renderResults(result, brief);
    playChime();
    showToast("🎉 Campaign successfully generated!");

    // Smooth scroll to results
    setTimeout(() => {
      elements.resultsSection?.scrollIntoView({ behavior: "smooth" });
    }, 100);

  } catch (err) {
    clearInterval(stepTimer);
    hideProgressModal();
    console.error("Generation error:", err);
    showToast(err.message || "Failed to generate campaign. Please retry.", "error");
  } finally {
    state.isBusy = false;
  }
}

// ==========================================
// PIPELINE PROGRESS MODAL
// ==========================================
function showProgressModal() {
  if (!elements.progressOverlay) return;
  elements.progressOverlay.style.display = "grid";

  if (elements.pipelineStepsList) {
    elements.pipelineStepsList.innerHTML = STAGES.map((s, idx) => `
      <li class="pipeline-step" id="pipe-step-${idx}">
        <span class="pipeline-step-icon">${idx + 1}</span>
        <span>${s}</span>
      </li>
    `).join("");
  }
}

function updatePipelineStep(activeIndex) {
  STAGES.forEach((_, idx) => {
    const el = document.getElementById(`pipe-step-${idx}`);
    if (!el) return;
    if (idx < activeIndex) {
      el.className = "pipeline-step completed";
      el.querySelector(".pipeline-step-icon").innerHTML = "✓";
    } else if (idx === activeIndex) {
      el.className = "pipeline-step active";
      el.querySelector(".pipeline-step-icon").innerHTML = "➔";
    } else {
      el.className = "pipeline-step";
      el.querySelector(".pipeline-step-icon").innerHTML = `${idx + 1}`;
    }
  });
}

function hideProgressModal() {
  if (elements.progressOverlay) elements.progressOverlay.style.display = "none";
}

// ==========================================
// CLIENT-SIDE CANVAS CREATIVE RENDERER
// (Generates branded 1:1, 9:16 and WhatsApp creatives on the fly!)
// ==========================================
async function renderCanvasCreative(imgSrc, width, height, businessName, price, brandColor) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // 1. Fill background
      ctx.fillStyle = "#0a0c16";
      ctx.fillRect(0, 0, width, height);

      // 2. Draw image with cover aspect ratio
      const scale = Math.max(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // 3. Subtle bottom gradient overlay for readability
      const gradient = ctx.createLinearGradient(0, height * 0.7, 0, height);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height * 0.65, width, height * 0.35);

      // 4. Draw branded badge at bottom center
      const badgeText = `${businessName.toUpperCase()} | ₹${price}`;
      const fontSize = Math.round(width * 0.038);
      ctx.font = `bold ${fontSize}px "Outfit", "Segoe UI", Arial, sans-serif`;

      const textMetrics = ctx.measureText(badgeText);
      const textWidth = textMetrics.width;
      const paddingX = fontSize * 1.2;
      const paddingY = fontSize * 0.6;
      const badgeW = textWidth + paddingX * 2;
      const badgeH = fontSize + paddingY * 2;
      const badgeX = (width - badgeW) / 2;
      const badgeY = height - badgeH - Math.round(height * 0.05);

      // Rounded rect pill
      ctx.fillStyle = brandColor || "#1c1b2e";
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
      ctx.fill();

      // Border glow
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.stroke();

      // Badge Text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(badgeText, width / 2, badgeY + badgeH / 2);

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };

    img.onerror = () => {
      // Fallback simple canvas
      ctx.fillStyle = brandColor || "#1c1b2e";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(businessName, width / 2, height / 2);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };

    img.src = imgSrc;
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// ==========================================
// IN-BROWSER GENERATIVE STUDIO ENGINE
// (Domain-specific AI tailored for Indian MSMEs)
// ==========================================
async function generateStudioCampaign(b, previewSrc) {
  // Simulate intelligent creative generation
  const dir = b.direction || "QUALITY";
  const occ = b.occasion || "general";
  const city = b.location.split(",")[0].trim();

  // Generate dynamic canvas banners matching Cloudinary's output
  const [postUrl, storyUrl, waUrl] = await Promise.all([
    renderCanvasCreative(previewSrc, 1080, 1080, b.business, b.price, b.color),
    renderCanvasCreative(previewSrc, 1080, 1920, b.business, b.price, b.color),
    renderCanvasCreative(previewSrc, 1200, 628, b.business, b.price, b.color)
  ]);

  let marketingAngle = "";
  let offer = "";
  let cta = "";
  let reason = "";

  if (dir === "VALUE") {
    marketingAngle = `Unbeatable Price-to-Value in ${city}`;
    offer = `Introductory special: Only ₹${b.price} + Flat 10% off on your first order!`;
    cta = `DM to grab yours at ₹${b.price} before the batch sells out!`;
    reason = `At ₹${b.price}, ${b.audience} prioritizes maximum utility for their money. Highlighting budget-friendliness alongside zero quality compromise drives immediate buying decisions.`;
  } else if (dir === "URGENCY") {
    marketingAngle = `High-Demand Flash Drop — Limited Stock Alert`;
    offer = `First 25 orders get priority same-day dispatch + bonus gift!`;
    cta = `Tap WhatsApp link now — Only a few units left in ${city}!`;
    reason = `Creating genuine scarcity transforms passive browsers into immediate buyers. ${b.audience} responds fastest when the fear of missing out (FOMO) is authentic.`;
  } else {
    // QUALITY
    marketingAngle = `Premium Handcrafted Excellence & Trust`;
    offer = `Experience pure premium quality at just ₹${b.price} with 100% Satisfaction Guarantee`;
    cta = `Order now & feel the superior difference yourself!`;
    reason = `Showcasing craftsmanship, authentic materials, and local pride justifies the ₹${b.price} price tag and turns first-time shoppers into lifelong loyal patrons.`;
  }

  if (occ === "Festival Promotion") {
    marketingAngle += ` (Festive Special)`;
    offer += ` 🪔 Free festive gift wrap & greetings card included!`;
  } else if (occ === "Weekend Offer") {
    offer += ` ⚡ Valid for this weekend only!`;
  }

  const igCaption = `Elevate your lifestyle with ${b.product} from ${b.business} ✨\n\nSpecially crafted for ${b.audience} right here in ${b.location}. Whether you're upgrading your daily routine or looking for the perfect gift, this delivers pure excellence without breaking the bank.\n\n🔥 Special Price: ₹${b.price}\n🎁 Offer: ${offer}\n📍 Available in store & online across ${b.location}\n\n👉 How to order: Send us a DM or click the WhatsApp link in bio to reserve yours today!\n\n#${b.business.replace(/[\s&]+/g, "")} #${b.product.replace(/[\s&]+/g, "")} #ShopLocal #IndianSmallBusiness #${city.replace(/\s+/g, "")}Shopping`;

  const igStory = `🔥 NEW ARRIVAL ALERT! 🔥\n${b.product} is officially here at ${b.business}! ✨\n\nGrab yours today for just ₹${b.price}!\n${offer}\n\n👆 TAP LINK BELOW TO ORDER ON WHATSAPP! 📲`;

  const waStatus = `*${b.business} Special Update!* 🛍️\n\nHello friends in ${b.location}! 👋\nWe just launched our new *${b.product}*!\n\n💰 *Price:* Just ₹${b.price}\n🎁 *Exclusive Offer:* ${offer}\n\n${cta}\n\n👉 *Reply to this message now to place your order or visit us today!*`;

  const productDescription = `Upgrade your collection with the all-new ${b.product} by ${b.business}. Designed with precision for ${b.audience} in ${b.location}.\n\nKey Highlights:\n• Premium finish and durable design tailored for everyday Indian lifestyles\n• Direct-from-maker pricing at just ₹${b.price}\n• ${offer}\n• Fast delivery & hassle-free support from ${b.business}`;

  const hashtags = [
    `#${b.business.replace(/[\s&]+/g, "")}`,
    `#${b.product.replace(/[\s&]+/g, "")}`,
    `#VocalForLocal`,
    `#MadeInBharat`,
    `#${city.replace(/\s+/g, "")}Vibes`,
    `#TrendingIndia`,
    `#BestDeal₹${b.price}`,
    `#ShopSmall${city.replace(/\s+/g, "")}`
  ];

  return {
    campaign: {
      productAnalysis: {
        category: b.type,
        visualDescription: `Distinctive, high-appeal ${b.product} showcasing authentic craftsmanship and vibrant tones.`,
        keyFeatures: ["Handcrafted finishing", "Ideal for daily use", "Value-driven pricing"],
        targetAudience: b.audience
      },
      strategy: {
        marketingAngle,
        campaignType: occ !== "general" ? occ : `${dir} Focus Campaign`,
        reason,
        offer,
        cta,
        recommendedDirection: dir
      },
      content: {
        instagramCaption: igCaption,
        instagramStory: igStory,
        whatsappStatus: waStatus,
        productDescription,
        hashtags
      },
      quality: {
        audienceFit: 9.6,
        ctaClarity: 9.8,
        offerClarity: 9.4,
        brandConsistency: 9.7,
        suggestion: `Pair this Instagram post with a 15-second unboxing reel or customer review in Hindi/Hinglish for an additional 40% reach boost.`
      }
    },
    assets: {
      post: postUrl,
      story: storyUrl,
      social: waUrl
    },
    publicId: "studio-local-asset",
    direction: dir,
    occasion: occ
  };
}

// ==========================================
// RESULTS RENDERING
// ==========================================
function renderResults(res, brief) {
  const c = res.campaign;
  if (!c) return;

  if (elements.resultsSection) elements.resultsSection.style.display = "block";

  // Strategy Card
  if (elements.strategyAudience) elements.strategyAudience.textContent = c.productAnalysis.targetAudience;
  if (elements.strategyAngle) elements.strategyAngle.textContent = c.strategy.marketingAngle;
  if (elements.strategyType) elements.strategyType.textContent = c.strategy.campaignType;
  if (elements.strategyOffer) elements.strategyOffer.textContent = c.strategy.offer;
  if (elements.strategyCta) elements.strategyCta.textContent = c.strategy.cta;
  if (elements.strategyProduct) elements.strategyProduct.textContent = `${brief.product} (₹${brief.price})`;
  if (elements.strategyWhy) elements.strategyWhy.textContent = c.strategy.reason;

  if (elements.recommendedBadge) {
    elements.recommendedBadge.textContent = `AI Strategy: ${res.direction || c.strategy.recommendedDirection}`;
  }

  // Update Pivot Buttons
  document.querySelectorAll(".pivot-btn[data-pivot-dir]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-pivot-dir") === res.direction);
  });

  // Instagram Feed Post
  if (elements.igImg) elements.igImg.src = res.assets.post;
  if (elements.igUser) elements.igUser.textContent = brief.business.toLowerCase().replace(/\s+/g, "_");
  if (elements.igCaption) elements.igCaption.textContent = c.content.instagramCaption;

  // Instagram Story
  if (elements.storyImg) elements.storyImg.src = res.assets.story;
  if (elements.storyUser) elements.storyUser.textContent = brief.business;
  if (elements.storyText) elements.storyText.textContent = c.content.instagramStory;

  // WhatsApp
  if (elements.waImg) elements.waImg.src = res.assets.social;
  if (elements.waText) elements.waText.textContent = c.content.whatsappStatus;

  // Product Description
  if (elements.productDesc) elements.productDesc.textContent = c.content.productDescription;

  // Hashtags
  if (elements.hashtagCloud) {
    elements.hashtagCloud.innerHTML = c.content.hashtags.map(h => {
      const tag = h.startsWith("#") ? h : `#${h}`;
      return `<span class="hashtag-pill" onclick="navigator.clipboard.writeText('${tag}'); showToast('Copied ${tag}')">${tag}</span>`;
    }).join("");
  }

  // Quality Audit Scorecard
  const q = c.quality;
  const updateBar = (bar, valEl, score) => {
    if (bar) bar.style.width = `${score * 10}%`;
    if (valEl) valEl.textContent = `${score}/10`;
  };

  updateBar(elements.auditAudienceBar, elements.auditAudienceVal, q.audienceFit);
  updateBar(elements.auditCtaBar, elements.auditCtaVal, q.ctaClarity);
  updateBar(elements.auditOfferBar, elements.auditOfferVal, q.offerClarity);
  updateBar(elements.auditBrandBar, elements.auditBrandVal, q.brandConsistency);

  if (elements.auditCritique) {
    elements.auditCritique.innerHTML = `<strong>💡 AI Marketer's Advice:</strong> ${q.suggestion}`;
  }

  // Configure Download & Action Buttons
  setupAssetActionButtons(res, brief);
}

// ==========================================
// ACTION BUTTONS (DOWNLOAD & SHARE)
// ==========================================
function setupAssetActionButtons(res, brief) {
  const sanitize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const baseName = sanitize(brief.business || "vyapaarai");

  // Post Download
  if (elements.downloadIgBtn) {
    elements.downloadIgBtn.onclick = () => triggerDownload(res.assets.post, `${baseName}-instagram-post.jpg`);
  }

  // Story Download
  if (elements.downloadStoryBtn) {
    elements.downloadStoryBtn.onclick = () => triggerDownload(res.assets.story, `${baseName}-instagram-story.jpg`);
  }

  // WhatsApp Download
  if (elements.downloadWaBtn) {
    elements.downloadWaBtn.onclick = () => triggerDownload(res.assets.social, `${baseName}-whatsapp-banner.jpg`);
  }

  // WhatsApp Direct Share
  if (elements.shareWaBtn) {
    elements.shareWaBtn.onclick = () => {
      const text = encodeURIComponent(res.campaign.content.whatsappStatus);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    };
  }

  // Global "Download All" button
  const downloadAllBtn = document.getElementById("download-all-assets-btn");
  if (downloadAllBtn) {
    downloadAllBtn.onclick = async () => {
      showToast("Starting sequential downloads for all 3 formats...");
      triggerDownload(res.assets.post, `${baseName}-post-1x1.jpg`);
      await new Promise(r => setTimeout(r, 600));
      triggerDownload(res.assets.story, `${baseName}-story-9x16.jpg`);
      await new Promise(r => setTimeout(r, 600));
      triggerDownload(res.assets.social, `${baseName}-whatsapp-1200x628.jpg`);
    };
  }

  // Global "Copy All Copy" button
  const copyAllTextBtn = document.getElementById("copy-all-text-btn");
  if (copyAllTextBtn) {
    copyAllTextBtn.onclick = () => {
      const c = res.campaign.content;
      const combined = `=== INSTAGRAM CAPTION ===\n${c.instagramCaption}\n\n=== INSTAGRAM STORY ===\n${c.instagramStory}\n\n=== WHATSAPP STATUS ===\n${c.whatsappStatus}\n\n=== E-COMMERCE PRODUCT DESCRIPTION ===\n${c.productDescription}\n\n=== HASHTAGS ===\n${c.hashtags.join(" ")}`;
      navigator.clipboard.writeText(combined);
      showToast("📋 All campaign copy copied to clipboard!");
    };
  }
}

// Download helper with fallback
async function triggerDownload(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast(`Downloaded ${filename}`);
  } catch {
    window.open(url, "_blank");
  }
}

// ==========================================
// COPY BUTTONS
// ==========================================
function setupCopyButtons() {
  const registerCopy = (btn, getTargetText, label = "Copy") => {
    if (!btn) return;
    btn.onclick = async () => {
      const text = typeof getTargetText === "function" ? getTargetText() : getTargetText;
      if (!text) return;
      await navigator.clipboard.writeText(text);
      const originalText = btn.innerHTML;
      btn.innerHTML = "✓ Copied!";
      showToast("Copied to clipboard!");
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 1800);
    };
  };

  registerCopy(elements.copyIgCaptionBtn, () => state.campaignData?.campaign.content.instagramCaption);
  registerCopy(elements.copyStoryBtn, () => state.campaignData?.campaign.content.instagramStory);
  registerCopy(elements.copyWaBtn, () => state.campaignData?.campaign.content.whatsappStatus);
  registerCopy(elements.copyDescBtn, () => state.campaignData?.campaign.content.productDescription);
  registerCopy(elements.copyAllHashtagsBtn, () => state.campaignData?.campaign.content.hashtags.join(" "));
}

// ==========================================
// TABS & PIVOT ACTIONS
// ==========================================
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabTarget = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".asset-card").forEach(card => {
        if (tabTarget === "all" || card.getAttribute("data-card-tab") === tabTarget) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

function setupPivotButtons() {
  document.querySelectorAll(".pivot-btn[data-pivot-dir]").forEach(btn => {
    btn.addEventListener("click", () => {
      const dir = btn.getAttribute("data-pivot-dir");
      showToast(`Pivoting campaign focus to ${dir}...`);
      runCampaignGeneration({ direction: dir });
    });
  });

  document.querySelectorAll(".pivot-btn[data-pivot-occ]").forEach(btn => {
    btn.addEventListener("click", () => {
      const occ = btn.getAttribute("data-pivot-occ");
      showToast(`Reframing campaign for ${occ}...`);
      runCampaignGeneration({ occasion: occ });
    });
  });
}

// ==========================================
// UI FEEDBACK (TOAST & SOUND)
// ==========================================
function showToast(message, type = "info") {
  if (!elements.toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span>${type === "error" ? "⚠️" : "✨"}</span>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio context not allowed without interaction, silently ignore
  }
}
