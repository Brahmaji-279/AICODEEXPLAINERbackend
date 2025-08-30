import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();

app.use(cors());
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

    // Combine user prompt with pasted code
    const finalPrompt = `You are an AI coding assistant. The user pasted this code:\n\n${code}\n\nTask: ${userPrompt}`;

    const response = await client.chat.completions.create({
      model: "mistralai/mistral-7b-instruct", // ✅ change model here
      messages: [{ role: "user", content: finalPrompt }],
    });

    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

