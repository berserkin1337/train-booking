// controllers/seatController.js
const db = require('../config/db');

// --- Coach Layout Configuration ---
const TOTAL_SEATS = 80;
const SEATS_PER_ROW = 7;
const LAST_ROW_SEATS = 3;
const FULL_ROWS = Math.floor((TOTAL_SEATS - LAST_ROW_SEATS) / SEATS_PER_ROW); // 11
const TOTAL_ROWS = FULL_ROWS + 1; // 12

exports.getSeatStatus = async (req, res) => {
  try {
    // Fetch all currently booked seats
    const bookedResult = await db.query('SELECT seat_row, seat_number, seat_label FROM booked_seats');
    // Create a Set for efficient lookup of booked seat labels
    const bookedSeatLabels = new Set(bookedResult.rows.map(seat => seat.seat_label));

    const allSeats = [];
    for (let row = 1; row <= TOTAL_ROWS; row++) {
      const seatsInThisRow = (row === TOTAL_ROWS) ? LAST_ROW_SEATS : SEATS_PER_ROW;
      for (let number = 1; number <= seatsInThisRow; number++) {
        const seatLabel = `R${row}S${number}`;
        allSeats.push({
          row: row,
          number: number,
          label: seatLabel,
          isBooked: bookedSeatLabels.has(seatLabel),
        });
      }
    }

    res.status(200).json(allSeats);

  } catch (error) {
    console.error('Error fetching seat status:', error);
    res.status(500).json({ error: 'Internal server error fetching seat status' });
  }
};
