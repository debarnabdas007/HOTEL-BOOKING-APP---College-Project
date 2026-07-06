// app/(dashboard)/hotels/page.tsx
"use client";

import React from "react";
import HotelsTab from "../../components/HotelsTab";
import { useStats } from "../../context/StatsContext";

export default function HotelsPage() {
  const { setSearchedCity } = useStats();

  const handleSearch = (city: string) => {
    setSearchedCity(city);
  };

  return <HotelsTab onSearch={handleSearch} />;
}
