"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios"; // <-- Add axios (or use your apiClient)
import { useAuth } from "@/hooks/useAuth"; // <-- Add useAuth
import { getApiErrorMessage } from "@/lib/api"; // <-- Add error helper
import LoadingSpinner from "./LoadingSpinner";

interface BookingControlsProps {
  availableSeatCount: number;
  onBookSeats: (numSeats: number) => Promise<void>;
  isBookingLoading: boolean;
  bookingError: string | null;
  bookingSuccess: string | null;
  onResetSuccess: () => void; // <-- Add prop for reset callback
}

const MAX_SEATS_PER_BOOKING = 7;

const BookingControls: React.FC<BookingControlsProps> = ({
  availableSeatCount,
  onBookSeats,
  isBookingLoading,
  bookingError,
  bookingSuccess,
  onResetSuccess, // <-- Destructure the new prop
}) => {
  // Keep existing numSeats state as string
  const [numSeats, setNumSeats] = useState<string>("1");
  const [inputError, setInputError] = useState<string | null>(null);

  // --- Add State for Reset Operation ---
  const { token } = useAuth(); // Get auth token
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  // --- End Reset State ---

  const handleNumSeatsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setInputError(null);
    setResetError(null); // Clear reset error on input change
    setResetSuccess(null); // Clear reset success on input change

    if (inputValue === "") {
      setNumSeats("");
      setInputError("Number of seats cannot be empty");
      return;
    }

    const value = parseInt(inputValue, 10);

    if (isNaN(value)) {
      // Keep the invalid input displayed but maybe don't update state if preferred
      // setNumSeats(inputValue); // Keep showing what user typed even if NaN
      setInputError("Please enter a valid number");
      return; // Prevent further checks if not a number
    }

    // Allow typing, update state, set errors based on validation
    setNumSeats(inputValue);

    if (value < 1) {
      setInputError("Number of seats must be at least 1");
    } else if (value > MAX_SEATS_PER_BOOKING) {
      setInputError(
        `Maximum ${MAX_SEATS_PER_BOOKING} seats allowed per booking`
      );
    } else if (value > availableSeatCount) {
      setInputError(`Only ${availableSeatCount} seat(s) available`);
    } else {
      setInputError(null); // Clear error if valid
    }
  };

  const handleBookingSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError(null); // Clear reset error on booking submit
    setResetSuccess(null); // Clear reset success on booking submit

    // Re-validate before submitting based on the string state
    const seats = parseInt(numSeats, 10);

    if (isNaN(seats) || seats < 1 || seats > MAX_SEATS_PER_BOOKING) {
      setInputError(
        `Please enter a valid number between 1 and ${MAX_SEATS_PER_BOOKING}.`
      );
      return;
    }
    if (seats > availableSeatCount) {
      setInputError(`Not enough seats available (${availableSeatCount} left).`);
      return;
    }
    // Clear validation error if checks pass before submitting
    setInputError(null);

    // Prevent booking if resetting is in progress
    if (!isBookingLoading && !isResetting) {
      await onBookSeats(seats);
      // Reset input after successful booking attempt (optional)
      // setNumSeats("1");
    }
  };

  // --- Handler for Reset Button ---
  const handleResetBookings = async () => {
    if (
      !window.confirm(
        "ARE YOU SURE?\nThis will delete ALL booking data permanently."
      )
    ) {
      return;
    }

    setIsResetting(true);
    setResetError(null);
    setResetSuccess(null);
    setInputError(null); // Clear input error

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await axios.delete(`${API_BASE_URL}/bookings/reset`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 204) {
        setResetSuccess(
          response.data?.message || "All bookings reset successfully!"
        );
        onResetSuccess(); // Trigger data refresh in parent
        setNumSeats("1"); // Reset seat count input
      } else {
        setResetError("Failed to reset bookings. Unexpected response.");
      }
    } catch (err) {
      console.error("Reset failed:", err);
      setResetError(getApiErrorMessage(err));
    } finally {
      setIsResetting(false);
    }
  };
  // --- End Reset Handler ---

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Book Your Seats
      </h3>

      {/* --- Display Area for All Messages --- */}
      <div className="mb-4 space-y-2">
        {bookingSuccess && (
          <div className="p-3 bg-green-100 text-green-800 border border-green-300 rounded text-sm">
            {bookingSuccess}
          </div>
        )}
        {resetSuccess && (
          <div className="p-3 bg-blue-100 text-blue-800 border border-blue-300 rounded text-sm">
            {resetSuccess}
          </div>
        )}
        {bookingError && (
          <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
            {bookingError}
          </div>
        )}
        {resetError && (
          <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
            {resetError}
          </div>
        )}
      </div>
      {/* --- End Message Area --- */}

      {/* Booking Form */}
      <form onSubmit={handleBookingSubmit} className="mb-6">
        <div className="mb-4">
          <label
            htmlFor="numSeats"
            className="block text-gray-700 font-medium mb-2"
          >
            Number of Seats (1-{MAX_SEATS_PER_BOOKING}):{" "}
            {/* Show max allowed */}
          </label>
          <input
            // Keep type="number" for browser native controls if desired
            // but validation handles string state
            type="number"
            id="numSeats"
            value={numSeats} // Bind to string state
            onChange={handleNumSeatsChange}
            placeholder="Enter 1-7"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              inputError
                ? "border-red-500 ring-red-500" // Show error border
                : "border-gray-300 focus:ring-blue-500"
            }`}
            // Disable if booking OR resetting OR no seats available
            disabled={
              isBookingLoading || isResetting || availableSeatCount === 0
            }
          />
          {/* Display validation errors */}
          {inputError && (
            <p className="mt-1 text-xs text-red-600">{inputError}</p>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 flex justify-center items-center ${
            isBookingLoading ||
            isResetting ||
            availableSeatCount === 0 ||
            !!inputError // Disable if loading, resetting, no seats, or input has error
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          }`}
          disabled={
            // Ensure consistent disabling
            isBookingLoading ||
            isResetting ||
            availableSeatCount === 0 ||
            !!inputError
          }
        >
          {isBookingLoading ? (
            <LoadingSpinner size="sm" color="text-white" />
          ) : (
            "Request Booking"
          )}
        </button>
        {availableSeatCount === 0 && !isBookingLoading && !isResetting && (
          <p className="mt-2 text-center text-sm text-red-600 font-medium">
            Sorry, the coach is full!
          </p>
        )}
      </form>
      <div className="border-t pt-4 text-center">
        <button
          onClick={handleResetBookings}
          // Disable if booking OR resetting is in progress
          disabled={isResetting || isBookingLoading}
          className={`px-4 py-2 rounded text-white text-sm font-semibold transition-colors ${
            isResetting || isBookingLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isResetting ? (
            <LoadingSpinner size="sm" color="text-white" />
          ) : (
            "Reset All Bookings"
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Warning: Clears all current bookings.
        </p>
      </div>
    </div>
  );
};

export default BookingControls;
