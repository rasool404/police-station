import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Police Station Admin",
  description: "Course project — Supabase + Next.js",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/stations", label: "Stations" },
  { href: "/officers", label: "Officers" },
  { href: "/persons", label: "Persons" },
  { href: "/complaints", label: "Complaints" },
  { href: "/cases", label: "Cases" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="brand">🛡️ Police Station Admin</div>
          <nav>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
