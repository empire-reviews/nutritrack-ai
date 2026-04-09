import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { encrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get("admin_token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "ai_configuration" }
    });

    if (!setting) return NextResponse.json({ settings: null });

    // When returning to admin, we mask the keys but show the rest of the config
    const data = JSON.parse(setting.value);
    const maskedData = {
      primary: { ...data.primary, apiKey: data.primary.apiKey ? "********" : "" },
      fallback1: { ...data.fallback1, apiKey: data.fallback1.apiKey ? "********" : "" },
      fallback2: { ...data.fallback2, apiKey: data.fallback2.apiKey ? "********" : "" },
    };

    return NextResponse.json({ settings: maskedData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get("admin_token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { settings, password } = await req.json();

    const oldSetting = await prisma.systemSetting.findUnique({
      where: { key: "ai_configuration" }
    });
    const oldData = oldSetting ? JSON.parse(oldSetting.value) : null;

    function prepareSlot(newSlot: any, oldSlot: any) {
      const prepared = { ...newSlot };
      
      // If key is empty or whitespace, treat as null (optional)
      if (!newSlot.apiKey || newSlot.apiKey.trim() === "") {
        prepared.apiKey = null;
      } else if (newSlot.apiKey === "********") {
        prepared.apiKey = oldSlot?.apiKey || null;
      } else {
        prepared.apiKey = encrypt(newSlot.apiKey);
      }
      return prepared;
    }

    const finalData = {
      primary: prepareSlot(settings.primary, oldData?.primary),
      fallback1: prepareSlot(settings.fallback1, oldData?.fallback1),
      fallback2: prepareSlot(settings.fallback2, oldData?.fallback2),
      updatedAt: new Date().toISOString()
    };

    console.log("[admin/settings] Auth Success. Updating database...");

    try {
      await prisma.systemSetting.upsert({
        where: { key: "ai_configuration" },
        create: { 
          id: "ai_config",
          key: "ai_configuration", 
          value: JSON.stringify(finalData) 
        },
        update: { 
          value: JSON.stringify(finalData) 
        },
      });

      return NextResponse.json({ success: true });
    } catch (dbErr) {
      console.error("[admin/settings] DB Upsert Failed:", dbErr);
      return NextResponse.json({ 
        error: "Database save failed", 
        details: dbErr instanceof Error ? dbErr.message : String(dbErr) 
      }, { status: 500 });
    }
  } catch (err) {
    console.error("[admin/settings] Critical Server Error:", err);
    return NextResponse.json({ 
      error: "Critical server logic failure",
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
