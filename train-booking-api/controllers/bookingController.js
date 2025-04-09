// controllers/bookingController.js
const { pool } = require('../config/db'); // Need pool for transactions

// --- Coach Layout Configuration (can be imported from a shared config file) ---
const TOTAL_SEATS = 80;
const SEATS_PER_ROW = 7;
const LAST_ROW_SEATS = 3;
const FULL_ROWS = Math.floor((TOTAL_SEATS - LAST_ROW_SEATS) / SEATS_PER_ROW); // 11
const TOTAL_ROWS = FULL_ROWS + 1; // 12
// --- End Configuration ---

exports.createBooking = async (req, res) => {
  const { numSeats } = req.body;
  const userId = req.user.userId; // Get userId from authenticated user (set by middleware)

  // --- Input Validation ---
  if (!numSeats || typeof numSeats !== 'number' || numSeats < 1 || numSeats > 7) {
    return res.status(400).json({ error: 'Invalid number of seats requested (must be between 1 and 7).' });
  }

  // --- Database Transaction ---
  const client = await pool.connect(); // Get a client from the pool

  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Get Currently Booked Seats (Lock potentially needed rows if high concurrency expected)
    // For moderate load, the UNIQUE constraint on booked_seats might be sufficient.
    // For higher concurrency, consider SELECT ... FOR UPDATE or FOR SHARE on relevant rows if needed,
    // but this adds complexity. We'll rely on the UNIQUE constraint for now.
    const bookedResult = await client.query('SELECT seat_row, seat_number, seat_label FROM booked_seats');
    const bookedSeatLabels = new Set(bookedResult.rows.map(seat => seat.seat_label));

    // 2. Determine Available Seats
    const availableSeats = [];
    for (let row = 1; row <= TOTAL_ROWS; row++) {
      const seatsInThisRow = (row === TOTAL_ROWS) ? LAST_ROW_SEATS : SEATS_PER_ROW;
      for (let number = 1; number <= seatsInThisRow; number++) {
        const seatLabel = `R${row}S${number}`;
        if (!bookedSeatLabels.has(seatLabel)) {
          availableSeats.push({ row, number, label: seatLabel });
        }
      }
    }

    // 3. Check if enough total seats are available
    if (availableSeats.length < numSeats) {
      await client.query('ROLLBACK'); // Rollback before sending response
      return res.status(400).json({ error: 'Not enough seats available in the coach.' });
    }

    // 4. Find Seats Based on Priority
    let seatsToBook = [];

    // --- Priority 1: Find seats in a single row ---
    let foundInSingleRow = false;
    for (let row = 1; row <= TOTAL_ROWS; row++) {
      const seatsInThisRow = (row === TOTAL_ROWS) ? LAST_ROW_SEATS : SEATS_PER_ROW;
      const availableInRow = availableSeats.filter(seat => seat.row === row);

      if (availableInRow.length >= numSeats) {
        // Found a row with enough seats, take the first 'numSeats' available in that row
        seatsToBook = availableInRow.slice(0, numSeats);
        foundInSingleRow = true;
        console.log(`Booking Priority 1: Found ${numSeats} seats in Row ${row}`);
        break; // Stop searching rows
      }
    }

    // --- Priority 2: Find nearby/any available seats if not found in a single row ---
    if (!foundInSingleRow) {
      console.log(`Booking Priority 2: Could not find ${numSeats} seats in a single row. Booking first available.`);
      // Simply take the first 'numSeats' from the overall available list
      // This list is already sorted by row, then seat number, fulfilling the "nearby" criteria implicitly.
      seatsToBook = availableSeats.slice(0, numSeats);
    }

    // Should always find seats if the initial check passed, but double-check
    if (seatsToBook.length < numSeats) {
      await client.query('ROLLBACK');
      console.error("Booking logic error: Couldn't select enough seats after initial availability check.");
      return res.status(500).json({ error: 'Internal error processing booking logic.' });
    }


    // 5. Execute the Booking
    // Insert into bookings table
    const bookingInsertResult = await client.query(
      'INSERT INTO bookings (user_id, num_seats_requested) VALUES ($1, $2) RETURNING id',
      [userId, numSeats]
    );
    const newBookingId = bookingInsertResult.rows[0].id;

    // Prepare bulk insert for booked_seats
    const insertValues = seatsToBook.map((seat, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(',');
    const insertParams = seatsToBook.flatMap(seat => [newBookingId, seat.row, seat.number, seat.label]);

    const insertQuery = `INSERT INTO booked_seats (booking_id, seat_row, seat_number, seat_label) VALUES ${insertValues}`;

    await client.query(insertQuery, insertParams);

    // 6. Commit Transaction
    await client.query('COMMIT');

    // 7. Send Success Response
    res.status(201).json({
      success: true,
      message: `Successfully booked ${numSeats} seats.`,
      bookingId: newBookingId,
      bookedSeats: seatsToBook.map(s => s.label), // Return labels of booked seats
    });

  } catch (error) {
    // If any error occurs (including unique constraint violation), rollback
    await client.query('ROLLBACK');
    console.error('Booking Transaction Error:', error);

    // Handle specific errors like unique constraint violation (seat already booked)
    if (error.code === '23505' && error.constraint === 'unique_seat') {
      return res.status(409).json({ error: 'Conflict: One or more requested seats were booked by another user. Please try again.' });
    }

    res.status(500).json({ error: 'Internal server error during booking process.' });
  } finally {
    // VERY IMPORTANT: Release the client back to the pool
    client.release();
    console.log("Database client released.");
  }
};
