import { startOfYear, addDays, format } from "date-fns";

// Color intensity levels
export const INTENSITY_LEVELS = [
  { level: 0, label: "No activity", bg: "bg-slate-200 dark:bg-slate-800" },
  { level: 1, label: "Low", bg: "bg-green-200 dark:bg-green-900" },
  { level: 2, label: "Medium", bg: "bg-green-400 dark:bg-green-700" },
  { level: 3, label: "High", bg: "bg-green-600 dark:bg-green-600" },
  { level: 4, label: "Very high", bg: "bg-green-800 dark:bg-green-500" },
];

// Get color classes for a given activity level
export function getIntensityColor(count: number) {
  const level = Math.min(count, 4);
  const colors = [
    { bg: "bg-slate-200 dark:bg-slate-800", hover: "brightness-110" },
    { bg: "bg-green-200 dark:bg-green-900", hover: "brightness-110" },
    { bg: "bg-green-400 dark:bg-green-700", hover: "brightness-110" },
    { bg: "bg-green-600 dark:bg-green-600", hover: "brightness-110" },
    { bg: "bg-green-800 dark:bg-green-500", hover: "brightness-110" },
  ];
  return colors[level];
}

// Get activity level (0-4)
export function getActivityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

// Month labels
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function getMonthLabel(monthIndex: number): string {
  return MONTHS[monthIndex % 12];
}

// Generate random contribution data for a year
export function generateRandomData(year: number): Map<string, number> {
  const data = new Map<string, number>();
  const startDate = startOfYear(new Date(year, 0, 1));

  for (let i = 0; i < 365; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, "yyyy-MM-dd");

    // Generate random activity with realistic distribution
    const random = Math.random();
    let count = 0;

    if (random < 0.7) {
      count = 0; // 70% no activity
    } else if (random < 0.85) {
      count = Math.floor(Math.random() * 2) + 1; // 15% low activity
    } else if (random < 0.92) {
      count = Math.floor(Math.random() * 2) + 3; // 7% medium
    } else if (random < 0.97) {
      count = Math.floor(Math.random() * 2) + 5; // 5% high
    } else {
      count = Math.floor(Math.random() * 3) + 7; // 3% very high
    }

    data.set(dateStr, count);
  }

  return data;
}

// Calculate stats from data
export function calculateStats(data: Map<string, number>) {
  let total = 0;
  let maxDay = 0;
  let activeDays = 0;

  data.forEach((value) => {
    total += value;
    if (value > maxDay) maxDay = value;
    if (value > 0) activeDays += 1;
  });

  return {
    total,
    maxDay,
    activeDays,
    totalDays: data.size,
  };
}
