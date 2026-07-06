// app/(dashboard)/rooms/page.tsx
"use client";

import React from "react";
import RoomsTab from "../../components/RoomsTab";
import { useStats } from "../../context/StatsContext";

export default function RoomsPage() {
  const { setAvailableRoomsCount } = useStats();

  return <RoomsTab onLoad={setAvailableRoomsCount} />;
}
