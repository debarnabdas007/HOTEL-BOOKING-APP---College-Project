// app/components/ReservationsTab.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { API_ENDPOINTS } from "../config";

interface ActiveReservation {
  Reservation_ID: number;
  Guest_Name: string;
  Check_In_Date: string;
  Check_Out_Date: string;
}

interface ReservationsTabProps {
  onSearch: (start: string, end: string, count: number) => void;
}

export default function ReservationsTab({ onSearch }: ReservationsTabProps) {
  // Use dates that match the mock data range (July 2026) by default
  const [startDate, setStartDate] = useState("2026-07-10");
  const [endDate, setEndDate] = useState("2026-07-15");
  const [reservations, setReservations] = useState<ActiveReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [executedSQL, setExecutedSQL] = useState("");

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

      // Document SQL Query
      setExecutedSQL(
        `SELECT Reservation_ID, Guest_Name, Check_In_Date, Check_Out_Date\nFROM Reservations\nWHERE Check_In_Date <= '${end}' AND Check_Out_Date >= '${start}';`,
      );

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
  }, [fetchActiveReservations]);

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActiveReservations(startDate, endDate);
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
      {/* Date Search header */}
      <div className="p-6 rounded-xl bg-card-bg border border-border shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05),0_8px_20px_-4px_rgba(0,0,0,0.03)]">
        <form
          onSubmit={handleQuery}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-primary-text tracking-tight">
              Active Reservation Windows
            </h2>
            <p className="text-xs text-secondary-text font-medium">
              DBMS Query 3: Check active reservation windows using start/end
              date criteria
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Start Date picker */}
            <div className="space-y-1.5 w-full sm:w-auto">
              <label className="text-[10px] font-bold text-muted-text uppercase tracking-widest block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-primary-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent text-sm w-full sm:w-44 transition-all"
              />
            </div>

            {/* End Date picker */}
            <div className="space-y-1.5 w-full sm:w-auto">
              <label className="text-[10px] font-bold text-muted-text uppercase tracking-widest block">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-border/80 rounded-xl text-primary-text focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent text-sm w-full sm:w-44 transition-all"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary-btn hover:bg-primary-btn-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 text-primary-btn-text rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer self-end w-full sm:w-auto shadow-sm border border-primary-btn active:translate-y-0"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 text-primary-btn-text"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
              Filter Windows
            </button>
          </div>
        </form>
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
        <div className="overflow-hidden border border-border rounded-xl bg-card-bg shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04),0_8px_20px_-4px_rgba(0,0,0,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/75 text-secondary-text text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">Reservation ID (PK)</th>
                  <th className="p-4">Guest Name</th>
                  <th className="p-4 text-center">Check-In Date</th>
                  <th className="p-4 text-center">Check-Out Date</th>
                  <th className="p-4 text-right">Status Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm text-primary-text">
                {reservations.map((res) => (
                  <tr
                    key={res.Reservation_ID}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs font-bold text-accent">
                      #{res.Reservation_ID}
                    </td>
                    <td className="p-4 font-extrabold text-primary-text">
                      {res.Guest_Name}
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-secondary-text font-semibold">
                      {formatDate(res.Check_In_Date)}
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-secondary-text font-semibold">
                      {formatDate(res.Check_Out_Date)}
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-medium-bg border border-medium-fg/10 text-medium-fg text-xs font-bold shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-medium-fg animate-pulse" />
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
