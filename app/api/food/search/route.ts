import { NextRequest, NextResponse } from "next/server";
import { searchUSDA } from "@/lib/food/usda";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json({ foods: [] });
  const foods = await searchUSDA(q, 20);
  return NextResponse.json({ foods });
}
