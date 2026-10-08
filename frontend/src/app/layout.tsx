import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vexis",
  description: "Check how job-ready you really are.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}