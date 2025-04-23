// useAdminLogin.ts
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginCredentials {
  username: string;  // Changed from email to username to match backend
  password: string;
}

interface LoginResponse {
  status: "success" | "error";
  message: string;
}

/**
 * Hook for handling admin login functionality
 */
export const useAdminLogin = () => {
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
      const formData = new FormData();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const apiUrl = `http://localhost:8000/admin-login`
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const data: LoginResponse = await response.json();

      if (data.status === "success") {
        // Set authentication in localStorage
        localStorage.setItem("adminAuthenticated", "true");
        return true;
      } else {
        setLoginError(data.message || "Invalid username or password");
        return false;
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  return {
    loginAdmin,
    isLoggingIn,
    loginError,
    clearLoginError: () => setLoginError(null),
  };
};