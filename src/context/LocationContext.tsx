"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface LocationContextType {
  userLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  permissionDenied: boolean;
  defaultLocation: Location;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default center: Mumbai (since design inspiration is meowmbai.fun)
const MUMBAI_COORDS = { lat: 19.0760, lng: 72.8777 };

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const fetchLocation = () => {
    setIsLoading(true);
    setError(null);
    
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
          setPermissionDenied(false);
        },
        (err) => {
          console.warn("Geolocation warning:", err.message);
          setError(err.message);
          setIsLoading(false);
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionDenied(true);
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        isLoading,
        error,
        permissionDenied,
        defaultLocation: MUMBAI_COORDS,
        refreshLocation: fetchLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
