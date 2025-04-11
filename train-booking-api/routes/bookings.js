// routes/bookings.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authenticateToken'); // Import middleware

// Protect the booking creation route
router.post('/', authenticateToken, bookingController.createBooking);
// // Reset all bookings (ADMIN LEVEL ACTION - requires authentication for now)
router.delete('/reset', authenticateToken, bookingController.resetAllBookings);


module.exports = router;
