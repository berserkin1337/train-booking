// src/components/SeatMap.tsx
import React from "react";
import { Seat as SeatType } from "@/lib/types";
import Seat from "./Seat";
import LoadingSpinner from "./LoadingSpinner";

interface SeatMapProps {
  seats: SeatType[];
  isLoading: boolean;
  error: string | null;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="my-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 p-4 bg-red-100 text-red-700 border border-red-300 rounded text-center">
        {error}
      </div>
    );
  }

  if (!seats || seats.length === 0) {
    return (
      <div className="my-8 text-center text-gray-500">
        No seat information available.
      </div>
    );
  }

  // Group seats by row
  const seatsByRow: { [key: number]: SeatType[] } = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      // Ensure seats within a row are sorted by number
      acc[seat.row].sort((a, b) => a.number - b.number);
      return acc;
    },
    {} as { [key: number]: SeatType[] }
  );

  const rows = Object.keys(seatsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow overflow-x-auto">
      <div className="text-center mb-4">
        <span className="inline-block w-4 h-4 bg-green-100 border border-green-400 rounded mr-1 align-middle"></span>{" "}
        Available
        <span className="inline-block w-4 h-4 bg-red-300 border border-red-500 rounded ml-4 mr-1 align-middle"></span>{" "}
        Booked
      </div>
      <div className="flex flex-col items-center space-y-2">
        {rows.map((rowNum) => (
          <div
            key={`row-${rowNum}`}
            className="flex items-center space-x-1 sm:space-x-2"
          >
            <span className="w-6 text-right font-semibold text-gray-600 text-sm mr-2">
              R{rowNum}
            </span>
            {seatsByRow[rowNum].map((seat) => (
              <Seat
                key={seat.label}
                label={seat.label}
                isBooked={seat.isBooked}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatMap;
