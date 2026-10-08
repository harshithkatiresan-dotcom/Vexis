import type { Metadata } from "next";
import "./globals.css";
import Helpdesk from "@/app/Helpdesk";

export const metadata: Metadata = {
  title: "Vexis",
  description: "Check how job-ready you really are.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-amber-50">
      <body className="min-h-screen bg-amber-50 text-stone-900 antialiased">
        {children}
        <Helpdesk />
      </body>
    </html>
  );
}