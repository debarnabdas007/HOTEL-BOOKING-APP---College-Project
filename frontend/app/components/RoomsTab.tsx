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
  const [executedSQL, setExecutedSQL] = useState("");

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

    // Set the exact SQL query executed in Backend/main.py
    setExecutedSQL(
      `SELECT Room_ID, Room_No, Room_Type, Price_Per_Night FROM Rooms WHERE Availability = 1;`,
    );

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
      <div className="p-6 rounded-xl bg-card-bg border border-border shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05),0_8px_20px_-4px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-primary-text tracking-tight">
              Available Rooms Directory
            </h2>
            <p className="text-xs text-secondary-text font-medium">
              DBMS Query 2: List rooms that are marked available (Availability =
              1)
            </p>
          </div>

          <button
            onClick={fetchAvailableRooms}
            disabled={loading}
            className="px-4 py-2 bg-secondary-btn border border-border-btn hover:bg-secondary-btn-hover text-secondary-btn-text disabled:opacity-50 hover:-translate-y-0.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer w-fit shadow-sm active:translate-y-0"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"
              />
            </svg>
            Refresh Directory
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/60">
          {/* Room Type select */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-text uppercase tracking-widest block">
              Room Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {roomTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                    selectedType === type
                      ? "bg-low-bg border-low-fg/40 text-low-fg"
                      : "bg-slate-50 border-border hover:bg-navbar-hover text-secondary-text"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[10px] font-bold text-muted-text uppercase tracking-widest block">
                Max Price per Night
              </label>
              <span className="text-low-fg font-extrabold font-mono text-xs bg-low-bg px-2.5 py-0.5 rounded-lg border border-low-fg/10">
                ₹{maxPrice.toLocaleString()}
              </span>
            </div>
            <div className="pt-1">
              <input
                type="range"
                min="0"
                max={
                  rooms.length > 0
                    ? Math.max(...rooms.map((r) => Number(r.Price_Per_Night))) +
                      1000
                    : 30000
                }
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-low-fg"
              />
              <div className="flex justify-between text-[10px] text-muted-text font-mono mt-1.5 font-bold">
                <span>₹0</span>
                <span>
                  ₹
                  {(rooms.length > 0
                    ? Math.max(...rooms.map((r) => Number(r.Price_Per_Night)))
                    : 30000
                  ).toLocaleString()}
                  +
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Query Debug Display */}
      {executedSQL && (
        <div className="p-4 rounded-xl bg-slate-50 border border-border shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-low-fg px-2 py-0.5 rounded-lg bg-low-bg font-extrabold uppercase text-[9px] tracking-wider border border-low-fg/10 font-sans">
              SQL ENGINE
            </span>
            <span className="font-mono text-[11px] text-primary-text font-medium select-all break-all leading-normal">
              {executedSQL}
            </span>
          </div>
          <span className="text-[10px] text-accent font-bold uppercase tracking-wider font-mono">
            Active DBMS Fetch
          </span>
        </div>
      )}

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
              className="group overflow-hidden rounded-xl border border-border bg-card-bg hover:border-border-btn shadow-[0_1px_3px_rgba(0,0,0,0.01),0_4px_12px_-3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06),0_12px_28px_-4px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Room Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-extrabold text-low-fg uppercase tracking-widest bg-low-bg px-2.5 py-0.5 rounded-full border border-low-fg/10 font-sans">
                      {room.Room_Type}
                    </span>
                    <h3 className="text-base font-bold text-primary-text leading-tight pt-1">
                      Room {room.Room_No}
                    </h3>
                  </div>

                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-50 border border-border text-secondary-text">
                    ID: #{room.Room_ID}
                  </span>
                </div>
              </div>

              {/* Room Footer */}
              <div className="p-4 bg-slate-50/50 border-t border-border flex items-center justify-between">
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

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-low-bg border border-low-fg/10 text-low-fg text-[10px] font-extrabold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-low-fg animate-pulse" />
                  Available
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
