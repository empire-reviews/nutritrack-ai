import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { heartbeat } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    await heartbeat(session.userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[heartbeat] route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
