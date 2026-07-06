// app/components/RoomsTab.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { API_ENDPOINTS } from "../config";

interface AvailableRoom {
  Room_ID: number;
  Room_No: string;
  Room_Type: string;
  Price_Per_Night: number;
}

interface RoomsTabProps {
  onLoad: (count: number) => void;
}

export default function RoomsTab({ onLoad }: RoomsTabProps) {
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filtering states
  const [selectedType, setSelectedType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(30000);

  // Use ref to store onLoad callback to prevent infinite render loops
  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  const fetchAvailableRooms = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_ENDPOINTS.rooms.available);
      if (!res.ok) {
        throw new Error("Failed to fetch available rooms");
      }
      const data = await res.json();
      const list = data.available_rooms || [];
      setRooms(list);
      onLoadRef.current(list.length);

      // Calculate max price dynamically if rooms are found
      if (list.length > 0) {
        const prices = list.map((r: AvailableRoom) =>
          Number(r.Price_Per_Night),
        );
        const highestPrice = Math.max(...prices);
        setMaxPrice(highestPrice + 1000); // Add buffer
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error fetching available rooms";
      setError(msg);
      onLoadRef.current(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAvailableRooms();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAvailableRooms]);

  // Compute filteredRooms directly during render
  const filteredRooms = rooms.filter((room) => {
    const matchesType =
      selectedType === "All" ||
      room.Room_Type?.toLowerCase() === selectedType.toLowerCase();
    const matchesPrice = Number(room.Price_Per_Night) <= maxPrice;
    return matchesType && matchesPrice;
  });

  // Extract unique room types dynamically
  const roomTypes = [
    "All",
    ...new Set(rooms.map((r) => r.Room_Type).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Container */}
      <div className="p-6 rounded-xl bg-card-bg border border-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-primary-text tracking-wide">
              Available Rooms Directory
            </h2>
            <p className="text-sm text-secondary-text pt-1 font-medium">
              List rooms that are currently available
            </p>
          </div>

          <button
            onClick={fetchAvailableRooms}
            disabled={loading}
            className="px-4 py-2 bg-secondary-btn border border-border hover:bg-secondary-btn-hover text-secondary-btn-text disabled:opacity-50 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
          {/* Room Type select */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-secondary-text block">
              Room Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {roomTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                    selectedType === type
                      ? "bg-rose-500 text-primary-btn-text"
                      : "bg-navbar-bg border-border text-secondary-text"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main room grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-xs text-muted-text animate-pulse font-bold uppercase tracking-wider font-mono">
            Running query on Rooms table...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 text-center rounded-xl bg-high-bg border border-high-fg/20 text-high-fg">
          <p className="text-sm font-semibold">DBMS Error: {error}</p>
        </div>
      ) : filteredRooms.length === 0 ? (
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
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-primary-text mb-1">
            No Available Rooms Match
          </h3>
          <p className="text-xs text-muted-text max-w-sm leading-relaxed">
            No available rooms match your current filters. Adjust your category
            filters or price slider.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.Room_ID}
              className="group overflow-hidden rounded-xl border border-border bg-card-bg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Room Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-primary-text leading-tight pt-1">
                      Room {room.Room_No}
                    </h3>
                  </div>

                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg bg-navbar-bg border border-border text-secondary-text">
                    ID: #{room.Room_ID}
                  </span>
                </div>
              </div>

              {/* Room Footer */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-muted-text uppercase tracking-wider block font-bold">
                    Price Rate
                  </span>
                  <span className="text-base font-extrabold text-primary-text font-mono tracking-tight">
                    ₹{Number(room.Price_Per_Night).toLocaleString()}
                    <span className="text-[10px] text-muted-text font-normal">
                      /night
                    </span>
                  </span>
                </div>

                <span className="text-xs font-semibold text-low-fg bg-low-bg px-2.5 py-0.5 rounded-full border border-low-fg/10 font-sans">
                  {room.Room_Type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
