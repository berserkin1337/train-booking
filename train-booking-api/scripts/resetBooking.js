// scripts/resetBookings.js
require('dotenv').config({ path: '../.env' }); // Load .env variables from the root directory
const { pool } = require('../config/db'); // Import the pool from your db config
const readline = require('readline'); // Import readline for user confirmation

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function resetBookings() {
  console.warn('\n⚠️ WARNING: This script will permanently delete ALL booking data.');
  console.warn('   This includes all records in the "bookings" and "booked_seats" tables.');
  console.warn('   This action cannot be undone.\n');

  rl.question('❓ Are you sure you want to proceed? (Type "yes" to confirm): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Reset cancelled by user.');
      rl.close();
      process.exit(0); // Exit gracefully
    }

    // User confirmed, proceed with deletion
    rl.close(); // Close the readline interface
    console.log('\n⏳ Proceeding with booking reset...');

    const client = await pool.connect(); // Get a client from the pool

    try {
      console.log('   Starting database transaction...');
      await client.query('BEGIN'); // Start transaction

      console.log('   Deleting records from "booked_seats"...');
      // Option 1: Using DELETE (Safer if you have triggers, but potentially slower)
      // const deleteSeatsResult = await client.query('DELETE FROM booked_seats');
      // console.log(`     Deleted ${deleteSeatsResult.rowCount} seat records.`);

      // Option 2: Using TRUNCATE (Generally faster, resets ID sequences)
      // TRUNCATE needs specific privileges. We truncate both tables at once.
      // RESTART IDENTITY resets the SERIAL counters (good for clean testing)
      console.log('   Truncating "bookings" and "booked_seats" tables...');
      await client.query('TRUNCATE TABLE bookings, booked_seats RESTART IDENTITY');
      console.log('     Tables truncated successfully.');

      // If using DELETE, you need to delete from bookings *after* booked_seats
      // console.log('   Deleting records from "bookings"...');
      // const deleteBookingsResult = await client.query('DELETE FROM bookings');
      // console.log(`     Deleted ${deleteBookingsResult.rowCount} booking records.`);

      console.log('   Committing transaction...');
      await client.query('COMMIT'); // Commit the transaction

      console.log('\n✅✅✅ Booking data successfully reset! ✅✅✅');

    } catch (error) {
      console.error('\n❌❌❌ Error during booking reset! Rolling back changes. ❌❌❌');
      console.error('Error details:', error.message);
      try {
        await client.query('ROLLBACK'); // Rollback on error
        console.log('   Transaction rolled back successfully.');
      } catch (rollbackError) {
        console.error('   Failed to rollback transaction:', rollbackError);
      }
      process.exit(1); // Exit with an error code
    } finally {
      console.log('   Releasing database client...');
      client.release(); // VERY IMPORTANT: Release the client back to the pool
      console.log('   Closing database pool connection...');
      await pool.end(); // Close the pool gracefully
      console.log('   Database pool closed.');
    }
  });
}

// Run the function
resetBookings();