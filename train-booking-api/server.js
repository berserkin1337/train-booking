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
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) or requests from allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If you need to handle cookies or authorization headers
};

app.use(cors(corsOptions));
// Make sure options requests are handled if you have complex headers/methods
app.options('*', cors(corsOptions));
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
