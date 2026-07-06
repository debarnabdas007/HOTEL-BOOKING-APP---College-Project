// app/components/HomeHero.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { API_ENDPOINTS } from "../config";

interface Hotel {
  Hotel_ID: number;
  Hotel_Name: string;
  City: string;
}

interface AvailableRoom {
  Room_ID: number;
  Hotel_ID: number;
  Room_No: string;
  Room_Type: string;
  Price_Per_Night: string;
}

interface ActiveReservation {
  Reservation_ID: number;
  Guest_Name: string;
  Check_In_Date: string;
  Check_Out_Date: string;
  Hotel_Name: string;
  City: string;
}

export default function HomeHero() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "hotels" | "rooms" | "reservations"
  >("hotels");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search parameters
  const [searchCity, setSearchCity] = useState("Kolkata");
  const [roomType, setRoomType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(15000);
  const [startDate, setStartDate] = useState("2026-07-10");
  const [endDate, setEndDate] = useState("2026-07-15");

  // Search results
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [reservations, setReservations] = useState<ActiveReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Perform search queries
  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setIsOpen(true);
    try {
      if (activeTab === "hotels") {
        const res = await fetch(API_ENDPOINTS.hotels.searchCity(searchCity));
        if (res.ok) {
          const data = await res.json();
          setHotels(data.hotels || []);
        }
      } else if (activeTab === "rooms") {
        const res = await fetch(API_ENDPOINTS.rooms.available);
        if (res.ok) {
          const data = await res.json();
          const list: AvailableRoom[] = data.available_rooms || [];
          const filtered = list.filter((r) => {
            const matchesType =
              roomType === "All" ||
              r.Room_Type.toLowerCase() === roomType.toLowerCase();
            const matchesPrice = Number(r.Price_Per_Night) <= maxPrice;
            return matchesType && matchesPrice;
          });
          setRooms(filtered);
        }
      } else if (activeTab === "reservations") {
        const res = await fetch(
          API_ENDPOINTS.reservations.active(startDate, endDate),
        );
        if (res.ok) {
          const data = await res.json();
          setReservations(data.active_reservations || []);
        }
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const date = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10),
      );
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return dateStr;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto z-40" ref={dropdownRef}>
      {/* Outer Pill Search Bar */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between bg-white border border-border shadow-md rounded-full px-6 py-2.5 cursor-pointer hover:shadow-lg transition-all duration-200"
      >
        <div className="flex divide-x divide-border grow text-left">
          {/* Destination tab */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("hotels");
              setIsOpen(true);
            }}
            className={`px-6 py-1 grow flex flex-col justify-center rounded-full hover:bg-slate-50 transition-colors ${
              activeTab === "hotels" && isOpen
                ? "bg-slate-100/80 hover:bg-slate-100"
                : ""
            }`}
          >
            <span className="text-[10px] font-bold text-primary-text tracking-wide uppercase">
              Where
            </span>
            <span className="text-xs text-secondary-text font-medium mt-0.5">
              {activeTab === "hotels" ? `${searchCity} City` : "Search Hotels"}
            </span>
          </div>

          {/* Room tab */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("rooms");
              setIsOpen(true);
            }}
            className={`px-6 py-1 grow flex flex-col justify-center rounded-full hover:bg-slate-50 transition-colors ${
              activeTab === "rooms" && isOpen
                ? "bg-slate-100/80 hover:bg-slate-100"
                : ""
            }`}
          >
            <span className="text-[10px] font-bold text-primary-text tracking-wide uppercase">
              Rooms
            </span>
            <span className="text-xs text-secondary-text font-medium mt-0.5">
              {activeTab === "rooms" ? `${roomType} Type` : "Search Rooms"}
            </span>
          </div>

          {/* Date range tab */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("reservations");
              setIsOpen(true);
            }}
            className={`px-6 py-1 grow flex flex-col justify-center rounded-full hover:bg-slate-50 transition-colors ${
              activeTab === "reservations" && isOpen
                ? "bg-slate-100/80 hover:bg-slate-100"
                : ""
            }`}
          >
            <span className="text-[10px] font-bold text-primary-text tracking-wide uppercase">
              When
            </span>
            <span className="text-xs text-secondary-text font-medium mt-0.5">
              {formatDate(startDate)} – {formatDate(endDate)}
            </span>
          </div>
        </div>

        {/* Brand red search button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSearch();
          }}
          className="ml-2 px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search
        </button>
      </div>

      {/* Floating Dropdown Dialog Box */}
      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border border-border rounded-3xl p-6 mt-2 shadow-2xl space-y-5 animate-fade-in text-left">
          {/* Tab selectors inside Dropdown */}
          <div className="flex gap-4 border-b border-border pb-3">
            <button
              onClick={() => {
                setActiveTab("hotels");
                setSearched(false);
              }}
              className={`pb-1 text-sm font-bold tracking-wide transition-all border-b-2 ${
                activeTab === "hotels"
                  ? "text-rose-500 border-rose-500"
                  : "text-secondary-text border-transparent hover:text-primary-text"
              }`}
            >
              Hotels by City
            </button>
            <button
              onClick={() => {
                setActiveTab("rooms");
                setSearched(false);
              }}
              className={`pb-1 text-sm font-bold tracking-wide transition-all border-b-2 ${
                activeTab === "rooms"
                  ? "text-rose-500 border-rose-500"
                  : "text-secondary-text border-transparent hover:text-primary-text"
              }`}
            >
              Available Rooms
            </button>
            <button
              onClick={() => {
                setActiveTab("reservations");
                setSearched(false);
              }}
              className={`pb-1 text-sm font-bold tracking-wide transition-all border-b-2 ${
                activeTab === "reservations"
                  ? "text-rose-500 border-rose-500"
                  : "text-secondary-text border-transparent hover:text-primary-text"
              }`}
            >
              Active Reservations
            </button>
          </div>

          {/* Form options based on selected mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
            {activeTab === "hotels" && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-secondary-text tracking-wide uppercase">
                  Select City
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-border rounded-xl text-primary-text focus:bg-white focus:outline-none text-sm w-full transition-all cursor-pointer font-medium"
                >
                  <option value="Kolkata">Kolkata</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
            )}

            {activeTab === "rooms" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-secondary-text tracking-wide uppercase">
                    Category
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-border rounded-xl text-primary-text focus:bg-white focus:outline-none text-sm w-full transition-all cursor-pointer font-medium"
                  >
                    <option value="All">All Types</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-secondary-text tracking-wide uppercase block">
                    Max Price: ₹{maxPrice.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="30000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </>
            )}

            {activeTab === "reservations" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-secondary-text tracking-wide uppercase">
                    Check-In
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-border rounded-xl text-primary-text text-sm w-full font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-secondary-text tracking-wide uppercase">
                    Check-Out
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-border rounded-xl text-primary-text text-sm w-full font-medium"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleSearch}
              className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition-all h-9 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              Search Database
            </button>
          </div>

          {/* Quick Query Results */}
          {searched && (
            <div className="border-t border-border pt-4 mt-3 max-h-64 overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold text-secondary-text tracking-wide uppercase">
                Search Results
              </h4>

              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="w-5 h-5 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                </div>
              ) : activeTab === "hotels" ? (
                hotels.length === 0 ? (
                  <p className="text-xs text-muted-text py-2">
                    No hotels found in {searchCity}.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hotels.map((h) => (
                      <div
                        key={h.Hotel_ID}
                        className="p-3 bg-slate-50 border border-border rounded-xl flex items-center gap-3"
                      >
                        <span className="text-xl">🏢</span>
                        <div>
                          <p className="text-xs text-secondary-text font-bold uppercase tracking-wider font-mono">
                            Hotel ID #{h.Hotel_ID}
                          </p>
                          <p className="text-sm font-bold text-primary-text">
                            {h.Hotel_Name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : activeTab === "rooms" ? (
                rooms.length === 0 ? (
                  <p className="text-xs text-muted-text py-2">
                    No available rooms match filters.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rooms.map((r) => (
                      <div
                        key={r.Room_ID}
                        className="p-3 bg-slate-50 border border-border rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🔑</span>
                          <div>
                            <p className="text-xs text-secondary-text font-bold uppercase tracking-wider font-mono">
                              Room {r.Room_No} ({r.Room_Type})
                            </p>
                            <p className="text-xs font-semibold text-muted-text">
                              Hotel ID #{r.Hotel_ID}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-rose-500">
                          ₹{Number(r.Price_Per_Night).toLocaleString()}/night
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : reservations.length === 0 ? (
                <p className="text-xs text-muted-text py-2">
                  No reservations found in window.
                </p>
              ) : (
                <div className="space-y-2">
                  {reservations.map((res) => (
                    <div
                      key={res.Reservation_ID}
                      className="p-3 bg-slate-50 border border-border rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-extrabold text-primary-text text-sm">
                          {res.Guest_Name}
                        </p>
                        <p className="text-secondary-text font-medium mt-0.5">
                          {res.Hotel_Name} ({res.City})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-rose-500 font-bold uppercase tracking-wider font-mono">
                          ID #{res.Reservation_ID}
                        </p>
                        <p className="text-muted-text font-semibold mt-0.5">
                          Stays: {formatDate(res.Check_In_Date)} -{" "}
                          {formatDate(res.Check_Out_Date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
