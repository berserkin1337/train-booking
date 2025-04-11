// utils/authUtils.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const saltRounds = 10; // Cost factor for hashing

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const generateToken = (userId, email) => {
  const payload = { userId, email };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
};
