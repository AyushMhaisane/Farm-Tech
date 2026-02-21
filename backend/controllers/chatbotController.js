import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PineconeStore } from '@langchain/pinecone';
import { HumanMessage } from "@langchain/core/messages";

dotenv.config();

// Initialize AI & Database Clients Once
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pc.Index("agro-bot-index");

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
});

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.2,
});

// Helper Function: Fetch Weather
const getLiveWeatherHelper = async () => {
    try {
        const API_KEY = process.env.OPENWEATHER_API_KEY;
        const city = "Pune";
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();

        if (data.cod !== 200) return null;

        return {
            temp: data.main.temp,
            humidity: data.main.humidity,
            description: data.weather[0].description,
            rain: data.rain ? data.rain['1h'] : 0
        };
    } catch (error) {
        console.error("Weather API Error:", error);
        return null;
    }
};

// Controller: Get Weather
export const getWeather = async (req, res) => {
    const weather = await getLiveWeatherHelper();
    if (weather) res.json(weather);
    else res.status(500).json({ error: "Could not fetch weather" });
};

// Controller: Handle Chat Messages
export const handleChat = async (req, res) => {
    try {
        const userMessage = req.body.message || "";
        const uploadedImage = req.body.image || null;

        if (!userMessage && !uploadedImage) {
            return res.status(400).json({ error: "Message or image is required" });
        }

        console.log(`Received query: ${userMessage} | Image Attached: ${uploadedImage ? 'YES' : 'NO'}`);

        const weather = await getLiveWeatherHelper();

        let englishQuery = userMessage;
        const isNonEnglish = /[^\x00-\x7F]/.test(userMessage);

        if (isNonEnglish && userMessage.trim() !== "") {
            console.log("Translating to save Pinecone accuracy...");
            const translationPrompt = `Translate to standard English (return ONLY text): "${userMessage}"`;
            const translationResponse = await llm.invoke(translationPrompt);
            englishQuery = translationResponse.content.trim();
        }

        const isSmallTalk = !uploadedImage && /^(hi|hello|hey|how are you|who are you|thanks|thank you|good morning|namaste)\b/i.test(englishQuery.trim());

        let context = "";
        let searchResults = [];

        if (isSmallTalk) {
            console.log("🗣️ Small talk detected. Bypassing Pinecone Database.");
        } else if (englishQuery.trim() !== "") {
            console.log("🔍 Searching Pinecone...");
            const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex });
            searchResults = await vectorStore.similaritySearch(englishQuery, 3);
            context = searchResults.map(doc => doc.pageContent).join("\n\n");
        }

        const finalPromptText = `
You are an expert practical agricultural advisor for farmers in Maharashtra and india. 

Note : Give response only in the language which was used while providing the question.

LIVE WEATHER CONTEXT (Pune, Maharashtra):
- Temp: ${weather ? weather.temp + '°C' : 'Unknown'}
- Humidity: ${weather ? weather.humidity + '%' : 'Unknown'}
- Condition: ${weather ? weather.description : 'Clear'}
- Rain: ${weather ? weather.rain + 'mm' : '0mm'}

INSTRUCTIONS:
1. IF AN IMAGE IS ATTACHED: Act as a "Crop Doctor". Diagnose any visible plant diseases, pests, or soil issues in the image immediately.
2. If "Retrieved Context" has data, combine it with your visual diagnosis to provide actionable advice.
3. INTEGRATE WEATHER ADVICE: If humidity is >80%, warn about fungus. If rain is predicted, advise against pesticide spraying.
4. Always reply in the EXACT SAME LANGUAGE the farmer used (Marathi, Hindi, or English).
5. Provide actionable, bulleted steps. No long textbook talk.

Farmer's Question:
${userMessage || "Please analyze this image."}

Retrieved Context:
${context}
`;

        const messageContent = [
            { type: "text", text: finalPromptText }
        ];

        if (uploadedImage) {
            messageContent.push({
                type: "image_url",
                image_url: uploadedImage
            });
            console.log("📸 Image payload attached to Gemini Prompt!");
        }

        const finalAnswer = await llm.invoke([new HumanMessage({ content: messageContent })]);

        res.json({
            answer: finalAnswer.content,
            sources: searchResults.map(doc => doc.pageContent)
        });

    } catch (error) {
        console.error("Chat Error:", error);

        if (error.status === 429) {
            return res.status(429).json({ error: "AI Limit reached. Please wait a moment." });
        }
        if (error.type === 'entity.too.large') {
            return res.status(413).json({ error: "Image file is too large. Please upload a smaller picture." });
        }

        res.status(500).json({ error: "Something went wrong on the server." });
    }
};