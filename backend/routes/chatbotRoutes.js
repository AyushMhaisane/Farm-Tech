import express from 'express';
import { getWeather, handleChat } from '../controllers/chatbotController.js';

const router = express.Router();

// Route: GET /api/chatbot/weather
router.get('/weather', getWeather);

// Route: POST /api/chatbot/chat
router.post('/chat', handleChat);

export default router;