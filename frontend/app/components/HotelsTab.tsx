// app/components/HotelsTab.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { API_ENDPOINTS } from "../config";
import { useStats } from "../context/StatsContext";

interface Hotel {
  Hotel_Name: string;
}

interface HotelsTabProps {
  onSearch: (city: string, count: number) => void;
}

export default function HotelsTab({ onSearch }: HotelsTabProps) {
  const { searchedCity, setSearchedCity } = useStats();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Popular cities based on mock data in database
  const popularCities = ["Kolkata", "Mumbai", "Bangalore", "Delhi", "Chennai"];

  // Use ref to store onSearch callback to prevent infinite render loops
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const fetchHotels = useCallback(async (cityName: string) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_ENDPOINTS.hotels.searchCity(cityName));
      if (!res.ok) {
        throw new Error("Failed to fetch hotels");
      }
      const data = await res.json();
      const list = data.hotels || [];
      setHotels(list);

      // Update parent component with the count via stable ref
      onSearchRef.current(cityName, list.length);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error occurred while fetching data";
      setError(msg);
      setHotels([]);
      onSearchRef.current(cityName, 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHotels(searchedCity);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchedCity, fetchHotels]);

  return (
    <div className="space-y-6">
      {/* Search Header Container */}
      <div className="p-6 rounded-xl bg-card-bg border border-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-primary-text tracking-wide">
              Hotel Names by City
            </h2>
            <p className="text-sm text-secondary-text pt-1 font-medium">
              Hotels located in a specific city
            </p>
          </div>
        </div>

        {/* Quick select tags */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {popularCities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSearchedCity(c);
                  fetchHotels(c);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  searchedCity.toLowerCase() === c.toLowerCase()
                    ? "bg-rose-500 text-primary-btn-text"
                    : "bg-navbar-bg border-border text-secondary-text"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-xs text-muted-text animate-pulse font-bold uppercase tracking-wider font-mono">
            Running query on Hotels table...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 text-center rounded-xl bg-high-bg border border-high-fg/20 text-high-fg">
          <p className="text-sm font-semibold">Database Error: {error}</p>
        </div>
      ) : hotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center p-8 rounded-xl border-2 border-dashed border-border bg-card-bg">
          <div className="p-4 rounded-full bg-slate-50 text-disable-text mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-10.5h16.5m-16.5 3h16.5M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M4 21V4a2 2 0 012-2h12a2 2 0 012 2v17"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-primary-text mb-1">
            No Hotels Found
          </h3>
          <p className="text-xs text-muted-text max-w-sm leading-relaxed">
            No hotels are currently recorded in the database under &quot;
            {searchedCity}
            &quot;. Try searching for Kolkata, Mumbai, or Bangalore.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border bg-card-bg transition-all duration-300 flex items-center gap-4 group"
            >
              <div className="p-3.5 rounded-xl bg-navbar-bg border border-border text-rose-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V9a2 2 0 012-2h2a2 2 0 012 2v12m-6 0h6"
                  />
                </svg>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-secondary-text tracking-wide font-mono">
                  Hotel Name
                </span>
                <h3 className="text-base font-bold text-primary-text transition-colors duration-200 leading-tight">
                  {hotel.Hotel_Name}
                </h3>
                <p className="text-sm text-muted-text font-semibold">
                  Location: {searchedCity}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
