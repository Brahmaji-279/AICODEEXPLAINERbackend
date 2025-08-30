// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

// Allow your Vercel site + local dev
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN || "", 
  "https://aicodeexplainer-vu3y.vercel.app/", // e.g. https://aicodeexplainer.vercel.app
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked",+origin));
    },
    credentials: true,
  })
);

// Health check (Render can use this)
app.get("/health", (_req, res) => res.status(200).send("ok"));

// ---------- OpenRouter client (recommended free/low-cost gateway) ----------
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  // optional but recommended for OpenRouter analytics
  defaultHeaders: {
    "HTTP-Referer": process.env.PUBLIC_URL || "http://localhost",
    "X-Title": "AI Code Explainer",
  },
});

// API endpoint
app.post("/api/openai", async (req, res) => {
  try {
    const { code, userPrompt } = req.body;
    const finalPrompt = `You are an AI coding assistant. The user pasted this code:\n\n${code}\n\nTask: ${userPrompt}`;

    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: finalPrompt }],
      temperature: 0.2,
    });

    res.json({ result: response.choices?.[0]?.message?.content ?? "" });
  } catch (err) {
    console.error("API error:", err?.response?.data || err.message);
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Something went wrong";
    res.status(500).json({ error: msg });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server listening on ${PORT}`));
