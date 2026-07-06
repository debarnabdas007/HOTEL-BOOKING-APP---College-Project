// app/context/StatsContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

interface StatsContextType {
  searchedCity: string;
  hotelsCount: number;
  availableRoomsCount: number;
  activeReservationsCount: number;
  reservationWindow: { start: string; end: string };
  setSearchedCity: (city: string) => void;
  setHotelsCount: (count: number) => void;
  setAvailableRoomsCount: (count: number) => void;
  setActiveReservationsCount: (count: number) => void;
  setReservationWindow: (window: { start: string; end: string }) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [searchedCity, setSearchedCity] = useState("Kolkata");
  const [hotelsCount, setHotelsCount] = useState(0);
  const [availableRoomsCount, setAvailableRoomsCount] = useState(0);
  const [activeReservationsCount, setActiveReservationsCount] = useState(0);
  const [reservationWindow, setReservationWindow] = useState({
    start: "2026-07-10",
    end: "2026-07-15",
  });

  return (
    <StatsContext.Provider
      value={{
        searchedCity,
        hotelsCount,
        availableRoomsCount,
        activeReservationsCount,
        reservationWindow,
        setSearchedCity,
        setHotelsCount,
        setAvailableRoomsCount,
        setActiveReservationsCount,
        setReservationWindow,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStats must be used within a StatsProvider");
  }
  return context;
}
