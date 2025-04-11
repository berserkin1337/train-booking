-- Ensure script stops on error
\set ON_ERROR_STOP on

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table (Represents a single booking transaction)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Link booking to a user
    num_seats_requested INT NOT NULL CHECK (num_seats_requested > 0), -- Store how many seats were requested
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Booked Seats Table (Represents individual seats booked in a transaction)
-- This table defines the state of the coach.
CREATE TABLE IF NOT EXISTS booked_seats (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE, -- Link seat to a booking
    seat_row INT NOT NULL,
    seat_number INT NOT NULL, -- Seat number within the row (1 to 7 or 1 to 3)
    seat_label VARCHAR(10) NOT NULL, -- e.g., 'R1S1', 'R12S3' for easier identification
    CONSTRAINT unique_seat UNIQUE (seat_row, seat_number) -- Ensures a seat can only be booked once
);

-- Optional: Indexes for performance
CREATE INDEX IF NOT EXISTS idx_booked_seats_location ON booked_seats(seat_row, seat_number);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

\echo 'Database initialization script completed.'
