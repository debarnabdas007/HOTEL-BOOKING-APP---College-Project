// app/(dashboard)/reservations/page.tsx
"use client";

import React from "react";
import ReservationsTab from "../../components/ReservationsTab";
import { useStats } from "../../context/StatsContext";

export default function ReservationsPage() {
  const { setReservationWindow, setActiveReservationsCount } = useStats();

  const handleSearch = (start: string, end: string, count: number) => {
    setReservationWindow({ start, end });
    setActiveReservationsCount(count);
  };

  return <ReservationsTab onSearch={handleSearch} />;
}
