// src/components/ClientProtectRoute.tsx
"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner"; // Reuse spinner

interface ClientProtectRouteProps {
  children: ReactNode;
}

const ClientProtectRoute: React.FC<ClientProtectRouteProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If finished loading and not authenticated, redirect
    if (!isLoading && !isAuthenticated) {
      router.push("/login"); // Redirect to login page
    }
  }, [isLoading, isAuthenticated, router]);

  // While loading authentication status, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If authenticated, render the child components
  // If not authenticated, redirect happens via useEffect, rendering null briefly
  return isAuthenticated ? <>{children}</> : null;
};

export default ClientProtectRoute;
