// config/db.js
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

const pool = process.env.DATABASE_URL
  ? new Pool({ // Use connection string if available (e.g., from Heroku, Render)
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Add SSL for production if needed
  })
  : new Pool({ // Otherwise, use individual parameters
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database!');
  release(); // Release the client back to the pool
});


module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Export pool if direct access needed (e.g., for transactions)
};
