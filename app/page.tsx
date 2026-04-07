import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isOnboarded: true } });
  if (!user?.isOnboarded) redirect("/onboarding");
  redirect("/dashboard");
}

