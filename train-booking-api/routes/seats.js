// routes/seats.js
const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// No authentication needed to view seat status
router.get('/status', seatController.getSeatStatus);

module.exports = router;
