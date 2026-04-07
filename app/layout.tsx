import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "NutriTrack AI — AI-Powered Nutrition Tracker",
  description: "Track your nutrition, get AI-powered food recommendations, and reach your health goals with NutriTrack AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
