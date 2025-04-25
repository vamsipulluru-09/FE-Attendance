"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  status: "success" | "error";
  message: string;
}

export function useAdminLogin() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const loginAdmin = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      const apiurl = process.env.NEXT_PUBLIC_BACKEND

      const response = await fetch(`${apiurl}/admin-login`, {
        method: "POST",
        body: formData,
      });

      const data: LoginResponse = await response.json();

      if (data.status === "success") {
        router.push('/admin/dashboard');
        return true;
      } else {
        setLoginError(data.message || "Login failed");
        return false;
      }
    } catch (error) {
      setLoginError("An error occurred during login");
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logoutAdmin = () => {
    router.push('/role-select');
  };

  return {
    loginAdmin,
    logoutAdmin,
    isLoggingIn,
    loginError,
  };
}