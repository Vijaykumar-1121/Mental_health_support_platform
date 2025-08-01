const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Corrected paths to point inside the 'src' directory
const connectDB = require('./src/config/db.js');
const authRoutes = require('./src/routes/authRoutes.js');
const userRoutes = require('./src/routes/userRoutes.js');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---

// A simple test route
app.get('/', (req, res) => {
    res.send('MindWell API is running...');
});

// Mount the routes with correct paths
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


// --- Server Initialization ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
