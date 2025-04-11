// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const seatRoutes = require('./routes/seats');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---

const allowedOrigins = [
  'https://train-booking-pied.vercel.app',
  'http://localhost:3000'
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Parse JSON request bodies
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send('Train Booking API is running!');
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
