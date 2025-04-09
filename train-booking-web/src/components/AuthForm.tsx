// src/components/AuthForm.tsx
"use client";

import React, { useState, FormEvent } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface AuthFormProps {
  isLogin: boolean;
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>; // Make async
  isLoading: boolean; // Loading state passed from parent
  errorMessage: string | null; // Error message passed from parent
}

const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  onSubmit,
  isLoading,
  errorMessage,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading) {
      await onSubmit({ email, password });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {isLogin ? "Login" : "Sign Up"}
      </h2>
      <form onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {errorMessage}
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isLogin ? undefined : 6} // Add minlength for signup if desired
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 flex justify-center items-center ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="text-white" />
          ) : isLogin ? (
            "Login"
          ) : (
            "Sign Up"
          )}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
