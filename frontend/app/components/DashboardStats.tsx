// app/components/DashboardStats.tsx
"use client";

import React from "react";

interface DashboardStatsProps {
  searchedCity: string;
  hotelsInCityCount: number;
  availableRoomsCount: number;
  activeReservationsCount: number;
  reservationWindowStart: string;
  reservationWindowEnd: string;
}

export default function DashboardStats({
  searchedCity,
  hotelsInCityCount,
  availableRoomsCount,
  activeReservationsCount,
  reservationWindowStart,
  reservationWindowEnd,
}: DashboardStatsProps) {
  const stats = [
    {
      name: `Hotels in ${searchedCity}`,
      value: hotelsInCityCount,
      description: `Matching city criteria`,
      icon: (
        <svg
          className="w-6 h-6 text-primary-btn-bg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V9a2 2 0 012-2h2a2 2 0 012 2v12m-6 0h6"
          />
        </svg>
      ),
      iconWrapper: "bg-navbar-bg border-border",
      badgeText: "Query 1",
      badgeColor: "bg-primary-btn text-primary-btn-text",
      borderHover: "hover:border-accent/40",
    },
    {
      name: "Available Rooms",
      value: availableRoomsCount,
      description: "Ready for check-in",
      icon: (
        <svg
          className="w-6 h-6 text-primary-btn-bg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      iconWrapper: "bg-navbar-bg border-border",
      badgeText: "Query 2",
      badgeColor: "bg-low-bg text-low-fg",
      borderHover: "hover:border-low-fg/30",
    },
    {
      name: "Active Bookings",
      value: activeReservationsCount,
      description: `${reservationWindowStart} to ${reservationWindowEnd}`,
      icon: (
        <svg
          className="w-6 h-6 text-primary-btn-bg"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      iconWrapper: "bg-navbar-bg border-border",
      badgeText: "Query 3",
      badgeColor: "bg-medium-bg text-medium-fg",
      borderHover: "hover:border-medium-fg/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`relative overflow-hidden bg-card-bg p-6 transition-all duration-300 group
    ${
      i === 0
        ? "border border-border rounded-l-xl"
        : i === 1
          ? "border-t border-b border-r border-border"
          : "border-t border-b border-r border-border rounded-r-xl"
    }
  `}
        >
          {/* Top card bar decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-transparent transition-all duration-300" />

          <div className="flex items-center justify-between mb-5">
            <div
              className={`p-3.5 rounded-xl border transition-all duration-300 ${stat.iconWrapper}`}
            >
              {stat.icon}
            </div>
            <span className="text-5xl font-semibold tracking-tight text-primary-text transition-colors duration-300">
              {stat.value}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-secondary-text tracking-wide">
              {stat.name}
            </h3>
            <div className="flex items-baseline space-x-2">
              {/* <span className="text-4xl font-extrabold tracking-tight text-primary-text group-hover:text-accent transition-colors duration-300">
                {stat.value}
              </span> */}
            </div>
            {/* <p className="text-[10px] text-muted-text font-medium leading-normal mt-1">
              {stat.description}
            </p> */}
          </div>
        </div>
      ))}
    </div>
  );
}
