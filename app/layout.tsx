import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Running OS — Athlete System",
  description: "The operating system for endurance athletes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full overflow-hidden bg-ros-bg text-ros-text">
        {children}
      </body>
    </html>
  );
}
