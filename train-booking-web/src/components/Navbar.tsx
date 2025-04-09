"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation"; // Use navigation router

export default function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login"); // Redirect to login after logout
  };

  // Avoid rendering auth state during initial load
  if (isLoading) {
    return (
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Train Booker
          </Link>
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href={isAuthenticated ? "/coach" : "/"}
          className="text-xl font-bold hover:text-blue-200"
        >
          Train Booker
        </Link>
        <div className="space-x-4">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline">Welcome, {user?.email}!</span>
              <Link href="/coach" className="hover:text-blue-200">
                Book Seats
              </Link>
              {/* Add link to 'My Bookings' page if implemented */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link href="/signup" className="hover:text-blue-200">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
