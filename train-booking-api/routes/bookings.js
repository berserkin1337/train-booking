// routes/bookings.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authenticateToken'); // Import middleware

// Protect the booking creation route
router.post('/', authenticateToken, bookingController.createBooking);

// Optional: Add routes to get user's bookings etc.
// router.get('/my-bookings', authenticateToken, bookingController.getUserBookings);

module.exports = router;
