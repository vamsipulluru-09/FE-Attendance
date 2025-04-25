import { useState } from "react";

interface RequestResponse {
  status: "success" | "error";
  message: string;
}

export function useAdminCredentialsRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<RequestResponse | null>(null);

  const requestAdminCredentials = async (email: string): Promise<boolean> => {
    setIsSubmitting(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("email", email);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND || "";
      const response = await fetch(`${apiUrl}/send-admin-credentials`, {
        method: "POST",
        body: formData,
      });

      const data: RequestResponse = await response.json();
      setResponse(data);

      return data.status === "success";
    } catch (error) {
      setResponse({
        status: "error",
        message: "Failed to send request. Please try again.",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    requestAdminCredentials,
    isSubmitting,
    response,
  };
} 