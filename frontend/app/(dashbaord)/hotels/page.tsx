// app/(dashboard)/hotels/page.tsx
"use client";

import React from "react";
import HotelsTab from "../../components/HotelsTab";
import { useStats } from "../../context/StatsContext";

export default function HotelsPage() {
  const { setSearchedCity, setHotelsCount } = useStats();

  const handleSearch = (city: string, count: number) => {
    setSearchedCity(city);
    setHotelsCount(count);
  };

  return <HotelsTab onSearch={handleSearch} />;
}
