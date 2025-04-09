// src/components/BookingControls.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface BookingControlsProps {
  availableSeatCount: number; // Pass total available seats for validation
  onBookSeats: (numSeats: number) => Promise<void>; // Async handler
  isBookingLoading: boolean;
  bookingError: string | null;
  bookingSuccess: string | null;
}

const MAX_SEATS_PER_BOOKING = 7;

const BookingControls: React.FC<BookingControlsProps> = ({
  availableSeatCount,
  onBookSeats,
  isBookingLoading,
  bookingError,
  bookingSuccess,
}) => {
  const [numSeats, setNumSeats] = useState<number>(1);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleNumSeatsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setInputError(null); // Clear previous input errors on change

    if (isNaN(value)) {
      setNumSeats(1); // Reset or handle as needed
      return;
    }

    if (value < 1) {
      setInputError("Number of seats must be at least 1.");
      setNumSeats(1);
    } else if (value > MAX_SEATS_PER_BOOKING) {
      setInputError(
        `You can book a maximum of ${MAX_SEATS_PER_BOOKING} seats at a time.`
      );
      setNumSeats(MAX_SEATS_PER_BOOKING);
    } else if (value > availableSeatCount) {
      setInputError(`Only ${availableSeatCount} seat(s) available.`);
      // Optionally clamp to available count, or just show error
      setNumSeats(availableSeatCount > 0 ? availableSeatCount : 1);
    } else {
      setNumSeats(value);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInputError(null); // Clear input error before submitting

    if (numSeats < 1 || numSeats > MAX_SEATS_PER_BOOKING) {
      setInputError(
        `Please enter a number between 1 and ${MAX_SEATS_PER_BOOKING}.`
      );
      return;
    }
    if (numSeats > availableSeatCount) {
      setInputError(
        `Not enough seats available (${availableSeatCount} left). Please request fewer seats.`
      );
      return;
    }

    if (!isBookingLoading) {
      await onBookSeats(numSeats);
      // Reset input after successful booking? Or let parent handle it.
      // setNumSeats(1); // Example: reset after attempt
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Book Your Seats
      </h3>

      {/* Display Booking Success/Error Messages */}
      {bookingSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded">
          {bookingSuccess}
        </div>
      )}
      {bookingError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {bookingError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="numSeats"
            className="block text-gray-700 font-medium mb-2"
          >
            Number of Seats (1-
            {Math.min(MAX_SEATS_PER_BOOKING, availableSeatCount)}):
          </label>
          <input
            type="number"
            id="numSeats"
            value={numSeats}
            onChange={handleNumSeatsChange}
            min="1"
            max={MAX_SEATS_PER_BOOKING} // Max per single request
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              inputError
                ? "border-red-500 ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            disabled={isBookingLoading || availableSeatCount === 0}
          />
          {inputError && (
            <p className="mt-1 text-xs text-red-600">{inputError}</p>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 flex justify-center items-center ${
            isBookingLoading || availableSeatCount === 0 || !!inputError
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          }`}
          disabled={
            isBookingLoading || availableSeatCount === 0 || !!inputError
          }
        >
          {isBookingLoading ? (
            <LoadingSpinner size="sm" color="text-white" />
          ) : (
            "Request Booking"
          )}
        </button>
        {availableSeatCount === 0 && !isBookingLoading && (
          <p className="mt-2 text-center text-sm text-red-600 font-medium">
            Sorry, the coach is full!
          </p>
        )}
      </form>
    </div>
  );
};

export default BookingControls;
