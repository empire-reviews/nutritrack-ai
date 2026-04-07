import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, decimals = 0) {
  return n.toFixed(decimals);
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function getMacroPercent(consumed: number, target: number) {
  if (target === 0) return 0;
  return Math.min(Math.round((consumed / target) * 100), 999);
}

export function getMacroColor(percent: number) {
  if (percent <= 60) return "text-emerald-500";
  if (percent <= 85) return "text-amber-500";
  if (percent <= 100) return "text-emerald-500";
  return "text-red-500";
}

export function getMacroBarColor(percent: number) {
  if (percent <= 60) return "bg-emerald-500";
  if (percent <= 85) return "bg-amber-500";
  if (percent <= 100) return "bg-emerald-500";
  return "bg-red-500";
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
