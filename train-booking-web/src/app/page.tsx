// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Train Seat Booking</h1>
      <p className="text-lg text-gray-600 mb-8">
        Plan your journey and book your seats easily.
      </p>
      <div className="space-x-4">
        <Link href="/coach">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors">
            View Seats & Book
          </button>
        </Link>
        <Link href="/login">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded transition-colors">
            Login / Signup
          </button>
        </Link>
      </div>
    </div>
  );
}
