// app/components/ReservationsTab.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { API_ENDPOINTS } from "../config";

interface ActiveReservation {
  Reservation_ID: number;
  Guest_Name: string;
  Check_In_Date: string;
  Check_Out_Date: string;
  Hotel_Name: string;
  City: string;
}

interface ReservationsTabProps {
  onSearch: (start: string, end: string, count: number) => void;
}

export default function ReservationsTab({ onSearch }: ReservationsTabProps) {
  // Use dates that match the mock data range (July 2026) by default
  const startDate = "2026-07-10";
  const endDate = "2026-07-15";
  const [reservations, setReservations] = useState<ActiveReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Booking Form State Variables
  const [bookRoomID, setBookRoomID] = useState("");
  const [bookGuestName, setBookGuestName] = useState("");
  const [bookCheckIn, setBookCheckIn] = useState("2026-07-10");
  const [bookCheckOut, setBookCheckOut] = useState("2026-07-15");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Relational Dropdown State Variables for booking dialog
  const [dialogCity, setDialogCity] = useState("");
  const [dialogHotels, setDialogHotels] = useState<
    { Hotel_ID: number; Hotel_Name: string }[]
  >([]);
  const [dialogHotelID, setDialogHotelID] = useState("");
  const [dialogRooms, setDialogRooms] = useState<
    {
      Room_ID: number;
      Hotel_ID: number;
      Room_No: string;
      Room_Type: string;
      Price_Per_Night: string;
    }[]
  >([]);

  // Helper fetchers called from input onChange events to load relational dialog options
  const loadHotelsForCity = async (city: string) => {
    if (!city) {
      setDialogHotels([]);
      return;
    }
    try {
      const res = await fetch(API_ENDPOINTS.hotels.searchCity(city));
      if (res.ok) {
        const data = await res.json();
        setDialogHotels(data.hotels || []);
      }
    } catch (err) {
      console.error("Error loading hotels in dialog:", err);
    }
  };

  const loadRoomsForHotel = async (hotelId: string) => {
    if (!hotelId) {
      setDialogRooms([]);
      return;
    }
    try {
      const res = await fetch(API_ENDPOINTS.rooms.available);
      if (res.ok) {
        const data = await res.json();
        const allRooms: {
          Room_ID: number;
          Hotel_ID: number;
          Room_No: string;
          Room_Type: string;
          Price_Per_Night: string;
        }[] = data.available_rooms || [];
        const filtered = allRooms.filter(
          (r) => Number(r.Hotel_ID) === Number(hotelId),
        );
        setDialogRooms(filtered);
      }
    } catch (err) {
      console.error("Error loading rooms in dialog:", err);
    }
  };

  // Use ref to store the onSearch callback to prevent infinite render loops
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const fetchActiveReservations = useCallback(
    async (start: string, end: string) => {
      if (!start || !end) return;
      setLoading(true);
      setError("");

      try {
        const res = await fetch(API_ENDPOINTS.reservations.active(start, end));
        if (!res.ok) {
          throw new Error("Failed to fetch active reservations");
        }
        const data = await res.json();
        const list = data.active_reservations || [];
        setReservations(list);

        // Update parent component via stable ref
        onSearchRef.current(start, end, list.length);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Error occurred while querying active reservations";
        setError(msg);
        setReservations([]);
        onSearchRef.current(start, end, 0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActiveReservations(startDate, endDate);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchActiveReservations, startDate, endDate]);

  const handleBookRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookRoomID || !bookGuestName || !bookCheckIn || !bookCheckOut) {
      setBookingError("Please fill out all fields.");
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      const res = await fetch(API_ENDPOINTS.reservations.book, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Room_ID: parseInt(bookRoomID, 10),
          Guest_Name: bookGuestName,
          Check_In_Date: bookCheckIn,
          Check_Out_Date: bookCheckOut,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to book room.");
      }

      setBookingSuccess(
        `Booking successful! Reservation ID: #${data.Reservation_ID}`,
      );
      setBookRoomID("");
      setBookGuestName("");

      // Refresh parent/metrics counts & reload active reservation windows list!
      fetchActiveReservations(startDate, endDate);

      // Auto close dialog after successful booking
      setTimeout(() => {
        setIsDialogOpen(false);
        setBookingSuccess("");
      }, 2000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error booking reservation";
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  // Helper to format MySQL date strings into readable format
  const formatDate = (dateStr: string) => {
    try {
      // Split the mysql date YYYY-MM-DD to avoid timezone shifting
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Search Header Card */}
      <div className="p-6 rounded-xl bg-card-bg border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-primary-text tracking-wide">
              Add Reservations
            </h2>
            <p className="text-sm text-secondary-text pt-1 font-medium">
              Add new reservations here
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-4 w-full lg:w-auto">
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Add Booking trigger */}
              <button
                onClick={() => {
                  setDialogCity("");
                  setDialogHotelID("");
                  setBookRoomID("");
                  setBookGuestName("");
                  setBookingSuccess("");
                  setBookingError("");
                  setIsDialogOpen(true);
                }}
                className="px-6 py-2.5 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text rounded-xl font-semibold text-sm transition-all cursor-pointer h-10 flex items-center justify-center gap-1.5 border border-primary-btn grow sm:grow-0 whitespace-nowrap"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Book Room
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog Modal */}
      {isDialogOpen && (
        <div
          onClick={() => {
            setIsDialogOpen(false);
            setDialogCity("");
            setDialogHotelID("");
            setBookRoomID("");
            setBookGuestName("");
            setBookingSuccess("");
            setBookingError("");
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card-bg border border-border w-full max-w-lg rounded-xl p-6 space-y-5 shadow-xl relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-primary-text tracking-wide">
                Add Reservation
              </h3>
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  setDialogCity("");
                  setDialogHotelID("");
                  setBookRoomID("");
                  setBookGuestName("");
                  setBookingSuccess("");
                  setBookingError("");
                }}
                className="text-secondary-text hover:text-primary-text transition-colors p-1 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleBookRoom} className="space-y-4">
              <div className="space-y-4">
                {/* City select */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-secondary-text block">
                    City
                  </label>
                  <select
                    value={dialogCity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDialogCity(val);
                      setDialogHotelID("");
                      setBookRoomID("");
                      loadHotelsForCity(val);
                    }}
                    className="px-4 py-2.5 bg-slate-50 border border-border/85 rounded-xl text-primary-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent text-sm w-full transition-all cursor-pointer"
                  >
                    <option value=""> Choose City </option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                </div>

                {/* Hotel select */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-secondary-text block">
                    Hotel
                  </label>
                  <select
                    value={dialogHotelID}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDialogHotelID(val);
                      setBookRoomID("");
                      loadRoomsForHotel(val);
                    }}
                    disabled={!dialogCity}
                    className="px-4 py-2.5 bg-slate-50 border border-border/85 rounded-xl text-primary-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent text-sm w-full transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value=""> Choose Hotel </option>
                    {dialogHotels.map((h) => (
                      <option key={h.Hotel_ID} value={h.Hotel_ID}>
                        {h.Hotel_Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room select */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-secondary-text block">
                    Available Room
                  </label>
                  <select
                    value={bookRoomID}
                    onChange={(e) => setBookRoomID(e.target.value)}
                    disabled={!dialogHotelID}
                    className="px-4 py-2.5 bg-slate-50 border border-border/85 rounded-xl text-primary-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent text-sm w-full transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value=""> Choose Room </option>
                    {dialogRooms.map((r) => (
                      <option key={r.Room_ID} value={r.Room_ID}>
                        Room No {r.Room_No} ({r.Room_Type}) - ₹
                        {Number(r.Price_Per_Night).toLocaleString()}/night
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guest Name input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-secondary-text block">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={bookGuestName}
                    onChange={(e) => setBookGuestName(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-border/85 rounded-xl text-primary-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent text-sm w-full transition-all"
                  />
                </div>

                {/* Check-In input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-secondary-text block">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={bookCheckIn}
                    onChange={(e) => setBookCheckIn(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-border/85 rounded-xl text-primary-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent text-sm w-full transition-all"
                  />
                </div>

                {/* Check-Out input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-secondary-text block">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={bookCheckOut}
                    onChange={(e) => setBookCheckOut(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-border/85 rounded-xl text-primary-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent text-sm w-full transition-all"
                  />
                </div>
              </div>

              {/* Alert Status Banners */}
              {(bookingSuccess || bookingError) && (
                <div className="pt-2">
                  {bookingSuccess && (
                    <div className="text-sm text-low-fg font-bold bg-low-bg border border-low-fg/10 rounded-xl px-4 py-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-low-fg animate-pulse" />
                      {bookingSuccess}
                    </div>
                  )}
                  {bookingError && (
                    <div className="text-sm text-high-fg font-bold bg-high-bg border border-high-fg/20 rounded-xl px-4 py-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-high-fg animate-pulse" />
                      {bookingError}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setDialogCity("");
                    setDialogHotelID("");
                    setBookRoomID("");
                    setBookGuestName("");
                    setBookingSuccess("");
                    setBookingError("");
                  }}
                  className="px-4 py-2 bg-secondary-btn border border-border hover:bg-secondary-btn-hover text-secondary-btn-text rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-5 py-2.5 bg-primary-btn hover:bg-primary-btn-hover disabled:opacity-50 text-primary-btn-text rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border border-primary-btn"
                >
                  {bookingLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-primary-btn-text/20 border-t-primary-btn-text rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  )}
                  Add Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservations Display table/list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-xs text-muted-text animate-pulse font-bold uppercase tracking-wider font-mono">
            Running query on Reservations table...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 text-center rounded-xl bg-high-bg border border-high-fg/20 text-high-fg">
          <p className="text-sm font-semibold">DBMS Error: {error}</p>
        </div>
      ) : reservations.length === 0 ? (
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
                d="M6.75 3v2.25M12 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-primary-text mb-1">
            No Overlapping Reservations Found
          </h3>
          <p className="text-xs text-muted-text max-w-sm leading-relaxed">
            No reservations logged in the database overlap with the query
            window: {formatDate(startDate)} to {formatDate(endDate)}.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-border rounded-xl bg-card-bg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-navbar-bg text-secondary-text text-xs font-semibold tracking-wider">
                  <th className="p-4">Reservation ID (PK)</th>
                  <th className="p-4">Guest Name</th>
                  <th className="p-4">Hotel Name</th>
                  <th className="p-4">City</th>
                  <th className="p-4 text-center">Check-In Date</th>
                  <th className="p-4 text-center">Check-Out Date</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm text-primary-text">
                {reservations.map((res) => (
                  <tr
                    key={res.Reservation_ID}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs font-bold text-secondary-text">
                      #{res.Reservation_ID}
                    </td>
                    <td className="p-4 font-bold text-primary-text">
                      {res.Guest_Name}
                    </td>
                    <td className="p-4 font-semibold text-secondary-text">
                      {res.Hotel_Name}
                    </td>
                    <td className="p-4 font-medium text-secondary-text">
                      {res.City}
                    </td>
                    <td className="p-4 text-center text-xs text-secondary-text font-semibold">
                      {formatDate(res.Check_In_Date)}
                    </td>
                    <td className="p-4 text-center text-xs text-secondary-text font-semibold">
                      {formatDate(res.Check_Out_Date)}
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-high-bg border border-high-fg/10 text-high-fg text-xs font-bold">
                        Active Reserved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
