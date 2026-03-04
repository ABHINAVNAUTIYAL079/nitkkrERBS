/**
 * NIT KKR E-Rickshaw Fare Calculation Utility
 *
 * Fare Model:
 * ┌──────────────┬──────────────────────────────────────────────┐
 * │  Ride Type   │ Calculation                                  │
 * ├──────────────┼──────────────────────────────────────────────┤
 * │  Shared      │ ₹10 min fare; ₹5/km after 1km (per seat)    │
 * │  Private     │ ₹20 min fare; ₹8/km after 1km               │
 * └──────────────┴──────────────────────────────────────────────┘
 *
 * Surcharges:
 *  - Night Surcharge: +₹5 for rides between 10:00 PM and 6:00 AM
 *
 * Min Fares:
 *  - Shared: ₹10
 *  - Private: ₹20
 */

export type RideType = "shared" | "private";

export interface FareBreakdown {
  rideType: RideType;
  baseFare: number;
  distanceFare: number;
  nightSurcharge: number;
  totalFare: number;
  isNight: boolean;
}

// Fare constants
export const FARE_CONFIG = {
  shared: {
    base: 10,
    perKm: 5,
    freeKm: 1, // First 1 km is included in base fare
    label: "Shared",
    description: "Per seat · Economical",
    color: "emerald",
  },
  private: {
    base: 20,
    perKm: 8,
    freeKm: 1, // First 1 km is included in base fare
    label: "Private",
    description: "Full rickshaw · Comfortable",
    color: "blue",
  },
} as const;

const NIGHT_SURCHARGE = 5;
const NIGHT_START = 22; // 10 PM
const NIGHT_END = 6;    // 6 AM

export function isNightTime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= NIGHT_START || hour < NIGHT_END;
}

export function calculateFare(km: number, rideType: RideType, date: Date = new Date()): FareBreakdown {
  const config = FARE_CONFIG[rideType];
  const baseFare = config.base;
  const extraKm = Math.max(0, km - config.freeKm);
  const distanceFare = Math.round(extraKm * config.perKm);
  const isNight = isNightTime(date);
  const nightSurcharge = isNight ? NIGHT_SURCHARGE : 0;
  const totalFare = baseFare + distanceFare + nightSurcharge;

  return {
    rideType,
    baseFare,
    distanceFare,
    nightSurcharge,
    totalFare,
    isNight,
  };
}
