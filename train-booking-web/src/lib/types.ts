export interface User {
  id: number;
  email: string;
}

export interface Seat {
  row: number;
  number: number;
  label: string;
  isBooked: boolean;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  bookingId?: number;
  bookedSeats?: string[];
}

export interface ApiErrorResponse {
  error: string; // Matches the error structure from the backend
}