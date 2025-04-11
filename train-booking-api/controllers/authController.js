// controllers/authController.js
const db = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');

exports.signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' }); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const result = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    const newUser = result.rows[0];

    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser.id, email: newUser.email },
      token: token // Send token if auto-login is desired
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user by email
    const result = await db.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' }); // Use generic message
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' }); // Use generic message
    }

    // Generate JWT
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};
