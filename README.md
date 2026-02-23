
# 🌾 Agro-Bot: Multimodal AI Farming Assistant

An advanced, hyper-localized, multi-sensory AI agricultural expert designed specifically for Indian farmers. Moving beyond a standard RAG (Retrieval-Augmented Generation) chatbot, Agro-Bot combines **Multimodal Image Analysis**, **Live Weather Intelligence**, and a **Localized Voice Interface** to act as a proactive "Crop Doctor." 

## ⚠️ The Problem We Solve
Farmers face three major bottlenecks when seeking agricultural advice:
1. **The Language Barrier:** High-quality agronomy data is usually in English, but farmers communicate in regional languages like Marathi and Hindi.
2. **Context-Blind Advice:** Standard AI might recommend spraying pesticide, completely unaware that it is currently raining on the user's farm.
3. **Complex Text Interfaces:** Typing out the exact visual symptoms of a plant disease is difficult; farmers need visual and voice-first solutions.

## 💡 Core Features
* **📸 Multimodal "Crop Doctor":** Upload photos of diseased leaves or pests. The AI visually diagnoses the issue and cross-references it with a local agricultural vector database for actionable remedies.
* **🌤️ Weather-Injected Intelligence:** Before generating advice, the backend silently fetches live weather data for the user's location. If humidity is >80%, it proactively warns about fungal risks.
* **🎙️ Native Voice UI:** Features a hands-free, auto-playing voice interface. Farmers can speak in Marathi or Hindi, and the bot replies with synthesized, localized audio. 
* **⚡ Smart Intent Routing & Credit Saver:** Includes a 0ms-latency semantic router that bypasses the vector database for conversational small talk, alongside regex detection to skip translation API calls if the query is already in English.

## 🛠️ Technical Architecture & Tech Stack

**Frontend (Client-Side)**
* **React.js (Vite) & Tailwind CSS:** Mobile-first, responsive user interface.
* **Web Speech API:** Utilized for native browser Speech-to-Text and Text-to-Speech, with custom fallbacks for regional Indian languages.

**Backend (Server-Side)**
* **Node.js & Express.js:** Handles API routing and 50MB Base64 image payload parsing.
* **LangChain:** Orchestrates complex AI workflows, including translation, multimodal prompt construction, and vector store retrieval.
* **Databases:** **MongoDB** for standard app data and **Supabase** for authentication/storage.

**Artificial Intelligence & Data (RAG Pipeline)**
* **LLM (Reasoning & Vision):** `gemini-2.5-flash` by Google. Chosen for superior reasoning to synthesize weather data, image pixels, and database text simultaneously.
* **Embeddings:** `gemini-embedding-001` translates agricultural data into mathematical vectors for semantic search.
* **Vector Database:** **Pinecone** holds custom agricultural records to ground the AI in factual, localized knowledge, preventing hallucinations.
* **External APIs:** **OpenWeatherMap API** for real-time environmental context.

## ⚙️ How the RAG Pipeline Works
1. **Input:** The farmer speaks a question and/or attaches a photo of a sick plant.
2. **Translation & Routing:** Devanagari script is translated to English for accurate semantic matching. Small talk bypasses the database entirely.
3. **Retrieval:** The English query is converted into embeddings and searches the Pinecone database for the top most relevant agricultural facts using Cosine Similarity.
4. **Augmentation:** The image, translated text, Pinecone facts, and live OpenWeather data are bundled into a single prompt.
5. **Generation:** Gemini 2.5 Flash generates a highly accurate, localized response in the user's native language, preventing dangerous AI hallucinations.

## 🚀 Local Setup Instructions

### Prerequisites
* Node.js (v18+)
* API Keys for Pinecone, Google Gemini, OpenWeatherMap, and Supabase.

### 1. Clone the repository
git clone [https://github.com/yourusername/agro-bot.git](https://github.com/yourusername/agro-bot.git)
cd agro-bot


### 2. Backend Setup

cd backend
npm install
cp .env.sample .env
# Fill in your API keys in the backend .env file
npm run dev


### 3. Frontend Setup

Open a new terminal window:

cd frontend
npm install
cp .env.sample .env
# Fill in your Supabase keys in the frontend .env file
npm run dev



## 👨‍💻 Author

**Ayush Mhaisane** - Information Technology Undergraduate & Full-Stack Developer

