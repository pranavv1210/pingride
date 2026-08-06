import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PingRide Prototype",
  description: "Book a ride on WhatsApp. No app download. No signup. Just message and go.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
