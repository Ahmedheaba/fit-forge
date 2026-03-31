const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const Plan = require('../models/Plan');
const GymClass = require('../models/GymClass');

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body; // Expecting [{role: 'user', text: '...'}, {role: 'model', text: '...'}]
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format. Must be an array." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    // Fetch dynamic context from the database
    const plans = await Plan.find({ isActive: true });
    const classes = await GymClass.find({ isActive: true });

    let dbContext = "\n\nCRITICAL CONTEXT ABOUT FITFORGE GYM:\n";
    if (plans.length > 0) {
      dbContext += "\nAVAILABLE MEMBERSHIP PLANS:\n" + plans.map(p => `- ${p.name}: $${p.price} per ${p.duration.value > 1 ? p.duration.value + ' ' : ''}${p.duration.unit}. Features: ${p.features.join(', ')}. Description: ${p.description}`).join("\n");
    }
    if (classes.length > 0) {
      dbContext += "\n\nAVAILABLE GYM CLASSES:\n" + classes.map(c => `- ${c.name} (${c.category}) led by Trainer ${c.trainer.name}. Difficulty: ${c.difficulty}. Duration: ${c.duration} mins. Description: ${c.description}`).join("\n");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Map frontend specific messages to Gemini API format
    const geminiMessages = messages.map(msg => ({
       role: msg.role === 'model' ? 'model' : 'user',
       parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: geminiMessages,
      config: {
          systemInstruction: "You are FitForge AI, a friendly and helpful assistant for the FitForge Gym Application. You answer questions about workouts, membership, the gym's features, and provide helpful fitness suggestions. Keep your responses concise, engaging, and professional. Address the user directly. ALWAYS prefer the information provided in the 'CRITICAL CONTEXT ABOUT FITFORGE GYM' over your pre-trained knowledge." + dbContext,
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

module.exports = router;
