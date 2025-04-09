// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load .env variables

// Import routes
const authRoutes = require('./routes/auth');
const seatRoutes = require('./routes/seats');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
// Enable CORS for all origins (adjust for production if needed)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Optional: Add logging middleware here if desired

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);

// --- Basic Root Route (for testing if the server is up) ---
app.get('/', (req, res) => {
  res.send('Train Booking API is running!');
});

// --- Global Error Handler (Optional but recommended) ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
