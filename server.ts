import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini AI Assistant route for Ganjam Seva & Agri Mandi
app.post("/api/ai-assistant", async (req, res) => {
  try {
    const { prompt, language, context } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured.",
        response: language === "or" 
          ? "କ୍ଷମା କରିବେ, AI ସେବା ବର୍ତ୍ତମାନ ଉପଲବ୍ଧ ନାହିଁ। ଦୟାକରି ସିଧାସଳଖ ହାଟ ଦର କିମ୍ବା ଶ୍ରମିକ ନମ୍ବର ଯାଞ୍ଚ କରନ୍ତୁ।"
          : "Gemini API Key is missing. Please configure it in environment settings."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `
You are "Ganjam Mitra AI" (ଗଞ୍ଜାମ ମିତ୍ର), an intelligent, friendly hyper-local agricultural and service assistant for Ganjam district, Odisha, India (covering Berhampur, Aska, Bhanjanagar, Chatrapur, Hinjilicut, Digapahandi, Gopalpur, etc.).

Your primary duties:
1. Provide practical, accurate agricultural advice to local farmers (crop disease solutions, organic fertilizers, weather advice, fair mandi price guidance).
2. Help users find the right local service providers (electricians, plumbers, carpenters, daily wage laborers, tractor rentals) in Ganjam.
3. Language constraint: If the user requests language is "or" (Odia), answer primarily in fluent, warm, and natural Odia script (ଓଡ଼ିଆ). If "en", answer in clear, helpful English.
4. Keep answers concise, practical, easy to read for rural and semi-urban users, using bullet points and simple terms.
    `.trim();

    const fullPrompt = `${systemInstruction}\n\nCurrent Context: ${JSON.stringify(context || {})}\nUser Query: ${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: fullPrompt,
    });

    const replyText = response.text || (language === "or" ? "ଉତ୍ତର ମିଳିପାରିଲା ନାହିଁ।" : "No response generated.");
    return res.json({ text: replyText });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process request",
      response: req.body.language === "or" 
        ? "ଦୁଃଖିତ, କିଛି ବୈଷୟିକ ତ୍ରୁଟି ଘଟିଛି। ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।"
        : "Sorry, an error occurred while talking to Ganjam Mitra AI. Please try again."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ganjam Seva & Mandi App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
