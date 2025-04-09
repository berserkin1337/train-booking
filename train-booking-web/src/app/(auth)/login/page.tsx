// src/app/(auth)/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { loginUser, getApiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { token, user } = await loginUser(credentials);
      login(token, user); // Update auth context
      router.push("/coach"); // Redirect to booking page on successful login
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      isLogin={true}
      onSubmit={handleLogin}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
}
