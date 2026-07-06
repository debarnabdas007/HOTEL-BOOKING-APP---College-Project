// app/(dashboard)/layout.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardStats from "../components/DashboardStats";
import { useStats } from "../context/StatsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const {
    hotelsCount,
    availableRoomsCount,
    activeReservationsCount,
    reservationWindow,
  } = useStats();

  const isActive = (path: string) => pathname === path;

  const getHeaderTitle = () => {
    switch (pathname) {
      case "/rooms":
        return "Rooms";
      case "/reservations":
        return "Reservations";
      case "/hotels":
      default:
        return "Hotels";
    }
  };

  return (
    <div className="min-h-screen bg-card-bg text-primary-text flex flex-col font-sans selection:bg-accent/20">
      {/* Main Content Area with Sidebar Layout */}
      <div className="grow w-full mx-auto flex flex-col md:flex-row">
        {/* Left Side Navigation Panel */}
        <aside className="w-full md:w-64 border-r border-border p-4 space-y-6 md:sticky md:top-0 md:h-screen shrink-0">
          <nav className="flex flex-col gap-1">
            <Link
              href="/hotels"
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                isActive("/hotels")
                  ? "bg-primary-btn text-primary-btn-text shadow-md shadow-primary-btn/10"
                  : "text-secondary-text hover:text-primary-text hover:bg-navbar-bg"
              }`}
            >
              <svg
                className="w-4.5 h-4.5"
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
              Hotels
            </Link>

            <Link
              href="/rooms"
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                isActive("/rooms")
                  ? "bg-primary-btn text-primary-btn-text shadow-md shadow-primary-btn/10"
                  : "text-secondary-text hover:text-primary-text hover:bg-navbar-bg"
              }`}
            >
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Rooms
            </Link>

            <Link
              href="/reservations"
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                isActive("/reservations")
                  ? "bg-primary-btn text-primary-btn-text shadow-md shadow-primary-btn/10"
                  : "text-secondary-text hover:text-primary-text hover:bg-navbar-bg"
              }`}
            >
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Reservations
            </Link>
          </nav>
        </aside>

        {/* Right Side Content Panel */}
        <main className="grow px-6 py-8 md:p-10 space-y-8 overflow-y-auto">
          {/* Header Title */}
          <div className="">
            <h1 className="text-4xl font-semibold text-primary-text tracking-wide">
              {getHeaderTitle()}
            </h1>
          </div>

          {/* Metrics Banner */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-secondary-text tracking-wide pl-1">
              Metrics
            </h2>
            <DashboardStats
              hotelsInCityCount={hotelsCount}
              availableRoomsCount={availableRoomsCount}
              activeReservationsCount={activeReservationsCount}
              reservationWindowStart={reservationWindow.start}
              reservationWindowEnd={reservationWindow.end}
            />
          </section>

          {/* Tab Contents */}
          <section className="min-h-125">{children}</section>
        </main>
      </div>
    </div>
  );
}
