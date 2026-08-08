const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
const PORT = 3000;

console.log("API KEY LOADED:", !!process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/plan", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/create-trip", async (req, res) => {
    console.log("✅ /api/create-trip route reached");

    try {
        const {
            location,
            budget,
            time,
            interests
        } = req.body;

        console.log("Creating trip:", {
            location,
            budget,
            time,
            interests
        });

        const prompt = `
You are Trip Rescue, an intelligent Nepal travel planning assistant.

Create a realistic one-day travel itinerary.

Destination: ${location}
Budget: NPR ${budget}
Available time: ${time}
Interests: ${interests.join(", ")}

Rules:
- Stay within the budget.
- Respect the available time.
- Prioritize the selected interests.
- Create 3 to 5 activities.
- Include realistic times.
- Include estimated costs in NPR.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not use code fences.

Return exactly this structure:

{
  "location": "${location}",
  "totalCost": 0,
  "activities": [
    {
      "time": "10:00 AM",
      "name": "Activity name",
      "description": "Short description",
      "category": "Nature",
      "cost": 500
    }
  ]
}
`;

        console.log("🤖 Sending request to Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        console.log("✅ Gemini response received");

        let text = response.text.trim();

        console.log("Gemini response:", text);

        text = text.replace(/^```json\s*/i, "");
        text = text.replace(/^```\s*/i, "");
        text = text.replace(/\s*```$/i, "");

        const trip = JSON.parse(text);

        console.log("✅ Trip JSON parsed successfully");

        res.json(trip);

    } catch (error) {
        console.error("❌ Gemini error:", error);

        res.status(500).json({
            error: error.message || "Unable to generate trip right now."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Trip Rescue running at http://localhost:${PORT}`);
});
