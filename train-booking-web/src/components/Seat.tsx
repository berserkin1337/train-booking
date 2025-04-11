// src/components/Seat.tsx
import React from "react";
import clsx from "clsx";

interface SeatProps {
  label: string;
  isBooked: boolean;
}

const Seat: React.FC<SeatProps> = ({ label, isBooked }) => {
  const seatClasses = clsx(
    "w-10 h-10 sm:w-12 sm:h-12",
    "border rounded",
    "flex items-center justify-center",
    "text-xs sm:text-sm font-medium",
    "transition-colors duration-150",
    {
      "bg-green-100 border-green-400 text-green-800 cursor-default": !isBooked,
      "bg-red-300 border-red-500 text-red-900 cursor-not-allowed": isBooked,
      "opacity-70": isBooked,
    }
  );

  return (
    <div
      className={seatClasses}
      title={isBooked ? `${label} (Booked)` : `${label} (Available)`}
    >
      {label.split("S")[1]}
    </div>
  );
};

export default Seat;
