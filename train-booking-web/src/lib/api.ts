import axios from 'axios';
import { User, Seat, BookingResponse, ApiErrorResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') { // Ensure running client-side
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Functions ---

export const signupUser = async (credentials: Pick<User, 'email'> & { password: string }) => {
  const response = await apiClient.post<{ message: string; user: User; token: string }>('/auth/signup', credentials);
  return response.data;
};

export const loginUser = async (credentials: Pick<User, 'email'> & { password: string }) => {
  const response = await apiClient.post<{ message: string; user: User; token: string }>('/auth/login', credentials);
  return response.data;
};

export const fetchSeatStatus = async (): Promise<Seat[]> => {
  const response = await apiClient.get<Seat[]>('/seats/status');
  return response.data;
};

export const postBooking = async (numSeats: number): Promise<BookingResponse> => {
  const response = await apiClient.post<BookingResponse>('/bookings', { numSeats });
  return response.data;
};

// Helper to extract API error messages
export const getApiErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ApiErrorResponse;
      if (serverError && serverError.error) {
        return serverError.error;
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred.';
};

// Add a function to potentially verify token (optional, but good practice)
// export const verifyToken = async () => {
//   try {
//      // Assuming you add a GET /api/auth/me endpoint in the backend
//      const response = await apiClient.get<{ userId: number; email: string }>('/auth/me');
//      return response.data;
//   } catch (error) {
//     console.error("Token verification failed", error);
//     return null;
//   }
// }