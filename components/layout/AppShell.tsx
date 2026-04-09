import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { recordSession } from "@/lib/activity";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import ActivityTracker from "@/components/ActivityTracker";
import NotificationBanner from "@/components/NotificationBanner";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, isOnboarded: true },
  });
  if (!user?.isOnboarded) redirect("/onboarding");

  await recordSession(user.id);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar user={user} />
        <NotificationBanner />
        <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
          {children}
        </main>
      </div>
      <MobileNav />
      <ActivityTracker />
    </div>
  );
}
