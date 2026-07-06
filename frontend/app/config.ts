// app/config.ts

// Since we added next.config.ts rewrites, we can fetch from relative paths
// in the browser to automatically proxy requests and avoid CORS errors.
export const API_BASE_URL = "";

export const API_ENDPOINTS = {
  hotels: {
    searchCity: (city: string) => `/api/hotels/${encodeURIComponent(city)}`,
  },
  rooms: {
    available: `/api/rooms/available`,
  },
  reservations: {
    active: (startDate: string, endDate: string) =>
      `/api/reservations/active?start_date=${startDate}&end_date=${endDate}`,
    book: `/api/reservations/book`,
  },
};
