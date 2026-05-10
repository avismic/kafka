/**
 * server/index.js
 * Project Kafka - Backend Entry Point
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const dataRoutes = require('./routes/data');
const authRoutes = require('./routes/auth');
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middlewares
app.use(cors()); // Enables PWA (frontend) to communicate with API
app.use(express.json()); // Parses incoming JSON payloads

// 2. Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes); // Add this below your auth routes
app.get('/health', (req, res) => res.json({ status: 'Kafka Server Active' }));

// 4. Initialization
app.listen(PORT, () => {
    console.log(`Kafka API running on http://localhost:${PORT}`);
});