import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Crop Data Dictionary
const cropData = {
    rice: { kc: 1.2, maxMoisture: 95, minMoisture: 70 },
    wheat: { kc: 0.8, maxMoisture: 80, minMoisture: 40 },
    sugarcane: { kc: 1.25, maxMoisture: 90, minMoisture: 60 }
};

// GET: Satellite Weather Widget Data
export const getGamificationWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        // Reusing the secure key we set up for the chatbot!
        const API_KEY = process.env.OPENWEATHER_API_KEY;

        // Fixed the missing backticks for string interpolation
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);

        const dailyForecasts = response.data.list.filter((_, i) => i % 8 === 0).map(day => ({
            date: new Date(day.dt * 1000).toDateString().split(' ').slice(0, 3).join(' '),
            temp: Math.round(day.main.temp),
            rain: day.rain ? (day.rain['3h'] || 0) : 0,
            pop: Math.round(day.pop * 100)
        }));

        res.json(dailyForecasts);
    } catch (error) {
        console.error("Gamification Weather Route Error:", error.message);
        res.status(500).json({ error: "Failed to fetch weather." });
    }
};

// GET: The Hypersensitive Simulation Logic
export const runSimulation = async (req, res) => {
    try {
        const { lat, lon, plannedWater, cropType } = req.query;
        const API_KEY = process.env.OPENWEATHER_API_KEY;

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);
        const dailyForecasts = response.data.list.filter((_, i) => i % 8 === 0);

        const selectedCrop = cropData[cropType] || cropData.wheat;

        let currentMoisture = 50;
        let totalWastedUnits = 0;

        const simulationResults = dailyForecasts.map(day => {
            const temp = day.main.temp;
            const rain = day.rain ? (day.rain['3h'] || 0) : 0;

            const evapotranspiration = (temp / 2) * selectedCrop.kc;
            const addition = parseFloat(plannedWater) + rain;
            const potentialMoisture = currentMoisture + addition - evapotranspiration;

            let dailyPenalty = 0;
            if (potentialMoisture > selectedCrop.maxMoisture) {
                dailyPenalty = Math.round((potentialMoisture - selectedCrop.maxMoisture) * 3);
                totalWastedUnits += dailyPenalty;
            } else if (potentialMoisture < selectedCrop.minMoisture) {
                dailyPenalty = Math.round((selectedCrop.minMoisture - potentialMoisture) * 2.5);
                totalWastedUnits += dailyPenalty;
            }

            currentMoisture = Math.max(0, Math.min(100, potentialMoisture));

            let dayStatus = "Optimal";
            if (currentMoisture < selectedCrop.minMoisture) dayStatus = "Thirsty";
            if (currentMoisture > selectedCrop.maxMoisture) dayStatus = "Overwatered";

            return {
                date: new Date(day.dt * 1000).toDateString().split(' ').slice(0, 3).join(' '),
                temp: Math.round(temp),
                moisture: Math.round(currentMoisture),
                status: dayStatus,
                wastePenalty: dailyPenalty,
                rain: rain
            };
        });

        const summary = {
            efficiencyScore: Math.max(0, 100 - totalWastedUnits),
            totalWaste: totalWastedUnits
        };

        res.json({ forecast: simulationResults, summary: summary });

    } catch (error) {
        console.error("Simulation Route Error:", error.message);
        res.status(500).json({ error: "Failed to fetch data." });
    }
};