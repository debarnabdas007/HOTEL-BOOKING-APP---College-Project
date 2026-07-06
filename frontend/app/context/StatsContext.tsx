"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config";

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

  // Fetch total hotels count across all cities globally on mount
  useEffect(() => {
    const fetchAllHotels = async () => {
      const cities = ["Kolkata", "Mumbai", "Bangalore", "Delhi", "Chennai"];
      try {
        const promises = cities.map(async (city) => {
          const res = await fetch(API_ENDPOINTS.hotels.searchCity(city));
          if (res.ok) {
            const data = await res.json();
            return data.hotels?.length || 0;
          }
          return 0;
        });
        const counts = await Promise.all(promises);
        const total = counts.reduce((sum, count) => sum + count, 0);
        setHotelsCount(total);
      } catch (err) {
        console.error("Error fetching total hotels count in context:", err);
      }
    };
    fetchAllHotels();
  }, []);

  // Fetch available rooms count globally on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.rooms.available);
        if (res.ok) {
          const data = await res.json();
          setAvailableRoomsCount(data.available_rooms?.length || 0);
        }
      } catch (err) {
        console.error("Error fetching available rooms count in context:", err);
      }
    };
    fetchRooms();
  }, []);

  // Fetch active reservations count whenever reservationWindow changes
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch(
          API_ENDPOINTS.reservations.active(reservationWindow.start, reservationWindow.end)
        );
        if (res.ok) {
          const data = await res.json();
          setActiveReservationsCount(data.active_reservations?.length || 0);
        }
      } catch (err) {
        console.error("Error fetching active reservations count in context:", err);
      }
    };
    fetchReservations();
  }, [reservationWindow]);

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
