// src/app/(auth)/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
// If you want to auto-login after signup: import { useAuth } from '@/hooks/useAuth';
import { signupUser, getApiErrorMessage } from "@/lib/api";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  // const { login } = useAuth(); // Uncomment if auto-logging in

  const handleSignup = async (credentials: {
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const data = await signupUser(credentials);
      setSuccessMessage(data.message + " Please log in."); // Or data.message
      // Optional: Auto-login and redirect
      // login(data.token, data.user);
      // router.push('/coach');
      // For now, just show success and let them log in manually
      setTimeout(() => router.push("/login"), 2000); // Redirect after 2 secs
    } catch (error) {
      console.error("Signup failed:", error);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent rendering form if success message is shown
  if (successMessage) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-green-100 text-green-800 rounded-lg shadow-md text-center">
        {successMessage}
      </div>
    );
  }

  return (
    <AuthForm
      isLogin={false}
      onSubmit={handleSignup}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
}
