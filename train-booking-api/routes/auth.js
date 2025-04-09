// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
// Optional: Add a '/me' route to verify token and get user info
// const authenticateToken = require('../middleware/authenticateToken');
// router.get('/me', authenticateToken, (req, res) => res.json(req.user));

module.exports = router;
