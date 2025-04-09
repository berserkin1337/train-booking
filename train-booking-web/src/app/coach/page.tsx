// src/app/coach/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import SeatMap from "@/components/SeatMap";
import BookingControls from "@/components/BookingControls";
import ClientProtectRoute from "@/components/ClientProtectRoute"; // Import protection HOC
import { fetchSeatStatus, postBooking, getApiErrorMessage } from "@/lib/api";
import { Seat } from "@/lib/types";

// --- Data Fetching Hook (using simple state, SWR is better for production) ---
function useSeatData() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    // Function to manually refetch
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSeatStatus();
      setSeats(data);
    } catch (err) {
      console.error("Failed to fetch seat status:", err);
      setError(getApiErrorMessage(err));
      setSeats([]); // Clear seats on error
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means refetch function itself doesn't change

  useEffect(() => {
    refetch(); // Initial fetch
  }, [refetch]); // Run effect when refetch function changes (only once)

  return { seats, isLoading, error, refetch };
}
// --- End Data Fetching Hook ---

export default function CoachPage() {
  const {
    seats,
    isLoading: isLoadingSeats,
    error: seatError,
    refetch: refetchSeats,
  } = useSeatData();
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const handleBookSeats = async (numSeats: number) => {
    setIsBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const result = await postBooking(numSeats);
      if (result.success) {
        setBookingSuccess(
          `${result.message} Seats: ${result.bookedSeats?.join(", ")}`
        );
        await refetchSeats(); // Refetch seat status after successful booking
      } else {
        // Should not happen if API follows structure, but handle defensively
        setBookingError(
          result.message || "Booking failed for an unknown reason."
        );
      }
    } catch (error) {
      console.error("Booking request failed:", error);
      const apiErrorMsg = getApiErrorMessage(error);
      setBookingError(apiErrorMsg);
      // If error is 'Conflict', suggest trying again
      if (apiErrorMsg.includes("Conflict")) {
        setBookingError(
          apiErrorMsg +
            " Some seats might have been taken. Please check the map and try again."
        );
      }
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Calculate available seats count
  const availableSeatCount = seats.filter((seat) => !seat.isBooked).length;

  return (
    // Wrap the page content with the protection component
    <ClientProtectRoute>
      <div>
        <h1 className="text-3xl font-bold mb-6 text-center">
          Coach Seat Map & Booking
        </h1>

        {/* Display Seat Map */}
        <SeatMap seats={seats} isLoading={isLoadingSeats} error={seatError} />

        {/* Display Booking Controls - only if seats loaded without error */}
        {!isLoadingSeats && !seatError && (
          <BookingControls
            availableSeatCount={availableSeatCount}
            onBookSeats={handleBookSeats}
            isBookingLoading={isBookingLoading}
            bookingError={bookingError}
            bookingSuccess={bookingSuccess}
          />
        )}
      </div>
    </ClientProtectRoute>
  );
}
