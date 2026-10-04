# VyapaarAI: chalane ke 4 steps (Hinglish)
1. Node.js install karo (https://nodejs.org, LTS version).
2. `.env.local` file kholo (pehli baar start karne par apne aap ban jaati hai) aur 4 keys bharo:
   - GEMINI_API_KEY: https://aistudio.google.com/apikey (free)
   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET: https://console.cloudinary.com (Dashboard > Product Environment Credentials)
3. Windows: `start.bat` double-click karo. Mac/Linux: `./start.sh`.
   VS Code mein: folder open karo > Terminal > `npm install` then `npm run dev`.
4. Browser mein http://localhost:3001 kholo. Demo data pehle se bhara hai, bas product photo upload karke "Generate Campaign" dabao.

Keys save karne ke baad server restart karo (Ctrl+C, phir dobara start).
