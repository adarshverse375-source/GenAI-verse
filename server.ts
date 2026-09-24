import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize GoogleGenAI
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API 1: Chat with AI CBSE Class 10 Tutor
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
         res.status(400).json({ error: "Message is required" });
         return;
      }

      const systemInstruction = `You are "Brights AI", a highly encouraging, expert CBSE Class 10 learning mentor. Your goal is to guide students in Mathematics, Science, Social Science, and English Literature.
Explain concepts clearly using step-by-step breakdowns, key formulas, bullet points, and high-yield board exam tips.
Keep answers concise, direct, visually organized, and positive. Never be dismissive. If a user asks questions outside CBSE Class 10 topics, gently remind them that your main specialty is CBSE Class 10 but give a brief, helpful answer anyway.`;

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction,
          temperature: 0.7,
        },
        history: history || [],
      });

      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with Gemini" });
    }
  });

  // API 2: Dynamic Quiz Question Generator
  app.post("/api/gemini/quiz", async (req, res) => {
    try {
      const { subject, topic, count = 3 } = req.body;
      if (!subject || !topic) {
         res.status(400).json({ error: "Subject and topic are required" });
         return;
      }

      const prompt = `Generate exactly ${count} multiple choice questions (MCQs) for CBSE Class 10, Subject: ${subject}, Chapter/Topic: ${topic}.
The questions must align perfectly with the latest CBSE syllabus and Board exam patterns. Ensure varying difficulty (easy, medium, hard). Provide 4 options for each question, specify the correct answer option index (0 to 3), and write a concise, clear educational explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert CBSE Board Exam Paper setter. Generate accurate, engaging, high-yield multiple-choice questions in the specified JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionText: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exactly 4 options"
                    },
                    correctIndex: {
                      type: Type.INTEGER,
                      description: "0-based index of the correct answer (0, 1, 2, or 3)"
                    },
                    explanation: { type: Type.STRING, description: "Educational explanation of the correct answer." }
                  },
                  required: ["questionText", "options", "correctIndex", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("Quiz Generator API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz from Gemini" });
    }
  });

  // Vite integration
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
