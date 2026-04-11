import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

// Middlewares
// app.use(cors());
app.use(cors({
    origin: ["https://campus-portal-lemon.vercel.app", "http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

// Base Route
app.get('/', (req, res) => res.send("IET Placement Portal Backend Server is Running"));

// API Routers
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// Boot Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);
    await connectDB();
});
