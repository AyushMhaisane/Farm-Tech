import express from 'express';
import { getGamificationWeather, runSimulation } from '../controllers/gamificationController.js';

const router = express.Router();

router.get('/weather', getGamificationWeather);
router.get('/simulate', runSimulation);

export default router;