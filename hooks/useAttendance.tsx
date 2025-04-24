import { useState } from 'react';

type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

type EmployeeData = {
  entity_id: string;
  name: string;
  branch: string;
  distance: number;
};

type AttendanceResponse = {
  status: 'success' | 'error';
  message: string;
  employee?: EmployeeData;
};

export function useAttendanceApi() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<AttendanceResponse | null>(null);

  const processAttendance = async (
    action: 'checkin' | 'checkout',
    photoDataUrl: string,
    coordinates: Coordinates
  ) => {
    setIsSubmitting(true);
    setResponse(null);

    try {
      const response = await fetch(photoDataUrl);
      const blob = await response.blob();
      const photoFile = new File([blob], `${action}-photo.jpg`, { type: 'image/jpeg' });

      // Create form data for the API request
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('latitude', coordinates.latitude.toString());
      formData.append('longitude', coordinates.longitude.toString());

      // Make API request
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND
      const endpoint = `${apiUrl}/process-${action}`;
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error(`Server responded with status: ${apiResponse.status}`);
      }

      const result: AttendanceResponse = await apiResponse.json();
      setResponse(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const errorResponse: AttendanceResponse = {
        status: 'error',
        message: `Error during ${action}: ${errorMessage}`
      };
      setResponse(errorResponse);
      return errorResponse;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkIn = (photoDataUrl: string, coordinates: Coordinates) => {
    return processAttendance('checkin', photoDataUrl, coordinates);
  };

  const checkOut = (photoDataUrl: string, coordinates: Coordinates) => {
    return processAttendance('checkout', photoDataUrl, coordinates);
  };

  const resetResponse = () => {
    setResponse(null);
  };

  return {
    checkIn,
    checkOut,
    isSubmitting,
    response,
    resetResponse
  };
}