"use client";
import { useHeartbeat } from "@/hooks/useHeartbeat";

export default function ActivityTracker() {
  useHeartbeat();
  return null;
}
