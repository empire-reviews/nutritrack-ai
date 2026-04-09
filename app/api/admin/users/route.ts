import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get("admin_token")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const query = searchParams.get("query");

    // If userId provided, return deep profile data
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          aiTokenUsage: { take: 10, orderBy: { createdAt: "desc" } },
          _count: { select: { aiTokenUsage: true } },
          dailySummaries: { take: 7, orderBy: { date: "desc" } }
        }
      });
      
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      // Calculate recent activity
      const activity = await prisma.userActivity.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 7
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isOnline = activity.length > 0 && activity[0].lastHeartbeat > new Date(Date.now() - 5 * 60 * 1000);

      return NextResponse.json({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          country: user.country,
          createdAt: user.createdAt,
          passwordHash: user.passwordHash,
          role: user.role,
          isOnboarded: user.isOnboarded
        },
        profile: user.profile,
        tokenUsage: user.aiTokenUsage,
        dailySummaries: user.dailySummaries,
        activity,
        isOnline,
        _count: user._count
      });
    }

    // Otherwise return list with search
    const users = await prisma.user.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } }
        ]
      } : {},
      orderBy: { createdAt: "desc" },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        country: true, 
        createdAt: true,
        profile: { select: { goal: true } },
        _count: { select: { aiTokenUsage: true } }
      }
    });

    // Get online status for all listed users
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await prisma.userActivity.findMany({
      where: { lastHeartbeat: { gte: fiveMinsAgo } },
      select: { userId: true }
    });
    const onlineIds = new Set(onlineUsers.map(u => u.userId));

    const enrichedUsers = users.map(u => ({
      ...u,
      isOnline: onlineIds.has(u.id),
      goal: u.profile?.goal ?? "N/A",
      aiQueries: u._count.aiTokenUsage
    }));

    return NextResponse.json({ users: enrichedUsers });
  } catch (err) {
    console.error("[admin/users] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
