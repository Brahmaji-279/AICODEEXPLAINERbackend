import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();

// ✅ Allow both localhost (dev) and deployed Vercel frontend
const allowedOrigins = [
  "http://localhost:3000", // local dev
  "https://your-frontend.vercel.app", // replace with your Vercel frontend URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

// OpenRouter client setup
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// API endpoint
app.post("/api/openai", async (req, res) => {
  try {
    const { code, userPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const finalPrompt = `You are an AI coding assistant. 
The user pasted this code:\n\n${code}\n\nTask: ${userPrompt}`;

    const response = await client.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: finalPrompt }],
    });

    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error("❌ Backend error:", error.message || error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
