import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// IMPORT ROUTES
import chatbotRoutes from './routes/chatbotRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import { connectDB } from './config/db.js';
import resourceRoutes from './routes/resource.routes.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount Routes
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/resources', resourceRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Unified Dashboard Backend running on http://localhost:${PORT}`);
});