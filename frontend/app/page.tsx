// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import HomeHero from "./components/HomeHero";
import { API_ENDPOINTS } from "./config";
import { useStats } from "./context/StatsContext";

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

export default function RootPage() {
  const { reservationWindow } = useStats();
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [reservations, setReservations] = useState<ActiveReservation[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.rooms.available);
        if (res.ok) {
          const data = await res.json();
          setRooms(data.available_rooms || []);
        }
      } catch (err) {
        console.error("Failed to load rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    };

    const fetchReservations = async () => {
      try {
        const res = await fetch(
          API_ENDPOINTS.reservations.active(
            reservationWindow.start,
            reservationWindow.end,
          ),
        );
        if (res.ok) {
          const data = await res.json();
          setReservations(data.active_reservations || []);
        }
      } catch (err) {
        console.error("Failed to load reservations:", err);
      } finally {
        setLoadingReservations(false);
      }
    };

    fetchRooms();
    fetchReservations();
  }, [reservationWindow]);

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
        year: "numeric",
      });
    }
    return dateStr;
  };

  return (
    <div className="min-h-screen bg-navbar-bg/40 text-primary-text font-sans flex flex-col selection:bg-rose-500/20">
      {/* Airbnb-style Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border/80 px-6 py-4 m:px-10 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-rose-500 cursor-pointer"
        >
          <span className="text-xl font-bold tracking-tight hidden sm:inline">
            Liliaceae
          </span>
        </Link>

        {/* Navigation Middle Links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/hotels"
            className="px-4 py-2 hover:bg-slate-50 rounded-full text-sm font-semibold text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            Hotels
          </Link>
          <Link
            href="/rooms"
            className="px-4 py-2 hover:bg-slate-50 rounded-full text-sm font-semibold text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            Rooms
          </Link>
          <Link
            href="/reservations"
            className="px-4 py-2 hover:bg-slate-50 rounded-full text-sm font-semibold text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          >
            Reservations
          </Link>
        </nav>

        {/* User Account / Profile */}
        <div className="flex items-center gap-3">
          <Link
            href="/hotels"
            className="text-sm font-semibold text-secondary-text hover:text-primary-text hidden md:inline px-4 py-2 rounded-full hover:bg-slate-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white px-6 py-12 md:px-10 text-center space-y-6 border-b border-border/60">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary-text tracking-tight leading-tight">
            Find your next perfect database stay
          </h1> */}
          <p className="text-sm md:text-lg text-primary-text font-medium">
            Search hotel rooms, cities, and live bookings instantly using simple
            queries.
          </p>
        </div>

        {/* Mount search bar */}
        <div className="pt-2 pb-6">
          <HomeHero />
        </div>
      </section>

      {/* Main Grid Content Panels */}
      <main className="grow max-w-7xl mx-auto w-full px-6 py-12 md:px-10 space-y-16">
        {/* Section 1: Available Rooms */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
              Available Rooms
            </h2>
            {/* <p className="text-sm text-secondary-text">
              Explore top-rated hotel spaces currently open for reservation
            </p> */}
          </div>

          {loadingRooms ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="bg-slate-200 aspect-[4/3] rounded-xl w-full" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-12 text-center rounded-xl border-2 border-dashed border-border bg-white space-y-3">
              <span className="text-3xl block">🔑</span>
              <h3 className="font-bold text-primary-text">
                No Rooms Available
              </h3>
              <p className="text-xs text-muted-text max-w-sm mx-auto">
                All rooms are currently booked! Try refreshing or checking back
                later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <div
                  key={room.Room_ID}
                  className="p-5 bg-white border border-border/85 rounded-xl flex flex-col justify-between hover:border-rose-500/35 transition-colors cursor-pointer text-left"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono tracking-wider text-secondary-text">
                      <span>ROOM {room.Room_No}</span>
                      <span>ID #{room.Room_ID}</span>
                    </div>
                    <h3 className="font-semibold text-base text-primary-text leading-snug">
                      {room.Room_Type} Room
                    </h3>
                    <p className="text-xs text-secondary-text font-semibold">
                      Hotel ID: #{room.Hotel_ID}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-text font-bold tracking-wider">
                      Price Rate
                    </span>
                    <span className="text-sm font-extrabold text-rose-500 font-mono">
                      ₹{Number(room.Price_Per_Night).toLocaleString()}/night
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Active Reservations */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
              Active Reservations
            </h2>
            {/* <p className="text-sm text-secondary-text">
              Live reservation slots recorded in overlapping periods
            </p> */}
          </div>

          {loadingReservations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse p-5 border border-border rounded-xl bg-white space-y-2"
                >
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-12 text-center rounded-xl border-2 border-dashed border-border bg-white space-y-3">
              <span className="text-3xl block">📅</span>
              <h3 className="font-bold text-primary-text">
                No Reservations Found
              </h3>
              <p className="text-xs text-muted-text max-w-sm mx-auto">
                There are no reservations booked for this window range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reservations.map((res) => (
                <div
                  key={res.Reservation_ID}
                  className="p-5 bg-white border border-border/80 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left hover:border-rose-500/35 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-primary-text">
                        {res.Guest_Name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600">
                        Active Stay
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-secondary-text">
                      {res.Hotel_Name} •{" "}
                      <span className="font-medium">{res.City}</span>
                    </p>
                  </div>

                  <div className="text-left md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 w-full md:w-auto">
                    <p className="text-xs font-bold text-rose-500 font-mono">
                      Res ID #{res.Reservation_ID}
                    </p>
                    <p className="text-xs font-semibold text-muted-text mt-1">
                      {formatDate(res.Check_In_Date)} –{" "}
                      {formatDate(res.Check_Out_Date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
