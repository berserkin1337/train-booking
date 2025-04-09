import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // Import AuthProvider
import Navbar from "@/components/Navbar"; // Import Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Train Seat Booking",
  description: "Book seats for your next train journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {" "}
          {/* Wrap everything in AuthProvider */}
          <Navbar /> {/* Add Navbar here */}
          <main className="container mx-auto px-4 py-8">
            {" "}
            {/* Add some basic layout */}
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
