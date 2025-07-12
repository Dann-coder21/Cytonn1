// server/server.js

// This loads environment variables from a .env file (for PORT, database credentials, etc.)
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// --- STEP 1: LOAD THE ROUTE HANDLERS ---
// If there is an error in ANY of these required files, the server will crash on startup.
// Check your terminal for errors like "Cannot find module" or "TypeError".
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth'); // This tells Node to find and execute 'routes/auth.js'.

const app = express();
const PORT = process.env.PORT || 3000;

// --- STEP 2: APPLY MIDDLEWARE ---
// Middleware runs on every request before it hits the specific route handlers.
app.use(cors());        // Allows your Vue app (on a different port) to make requests.
app.use(express.json()); // Parses incoming request bodies with JSON payloads.

// --- STEP 3: MOUNT THE ROUTES ---
// This is the core routing logic.
// It tells Express: "If a request URL starts with '/api/auth', pass it to the `authRoutes` router."
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// --- STEP 4: START THE SERVER ---
// If the server crashes before this point, this line will never run,
// and your server will not be able to respond to any requests, causing a 404.
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}. If you see this, the server started successfully.`);
});