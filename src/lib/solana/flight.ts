// Haversine great-circle distance — the straight-line flight path a drone
// would actually take, unlike a road-routing distance which assumes streets.
const EARTH_RADIUS_KM = 6371;

// A conservative cruise speed for a small delivery drone, used only to turn
// distance into a rough ETA. Real routing (wind, no-fly zones, elevation)
// is out of scope — this is stated on the page that shows it.
const CRUISE_SPEED_KMH = 45;
const GROUND_HANDLING_MINUTES = 4;

export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export interface FlightEstimate {
  distanceKm: number;
  etaMinutes: number;
}

export function estimateFlight(
  hubLat: number,
  hubLng: number,
  padLat: number,
  padLng: number
): FlightEstimate {
  const distanceKm = haversineKm(hubLat, hubLng, padLat, padLng);
  const flightMinutes = (distanceKm / CRUISE_SPEED_KMH) * 60;
  return {
    distanceKm,
    etaMinutes: Math.round(flightMinutes + GROUND_HANDLING_MINUTES),
  };
}
