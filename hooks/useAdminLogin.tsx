// useAdminLogin.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie'

interface LoginCredentials {
  username: string;  // Changed from email to username to match backend
  password: string;
}

interface LoginResponse {
  status: "success" | "error";
  message: string;
  token: string;
}

/**
 * Hook for handling admin login functionality
 */
export function useAdminLogin() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  /**
   * Attempts to log in with the provided credentials
   */
  const loginAdmin = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        // Store the token in cookies
        Cookies.set('admin_token', data.token, { expires: 7 }); // Expires in 7 days
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
    // Remove the token from cookies
    Cookies.remove('admin_token');
    router.push('/role-select');
  };

  return {
    loginAdmin,
    logoutAdmin,
    isLoggingIn,
    loginError,
  };
}