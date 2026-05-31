import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Casebook",
  description: "Police case management",
};

const navByRole = {
  citizen: [
    { href: "/", label: "Lobby" },
    { href: "/report/new", label: "File Report" },
    { href: "/report/mine", label: "My Reports" },
  ],
  officer: [
    { href: "/", label: "Command" },
    { href: "/cases", label: "Cases" },
    { href: "/complaints", label: "Complaints" },
    { href: "/persons", label: "Persons" },
    { href: "/officers", label: "Officers" },
    { href: "/departments", label: "Departments" },
    { href: "/stations", label: "Stations" },
  ],
  chef: [
    { href: "/", label: "Command" },
    { href: "/cases", label: "Cases" },
    { href: "/complaints", label: "Complaints" },
    { href: "/persons", label: "Persons" },
    { href: "/officers", label: "Officers" },
    { href: "/departments", label: "Departments" },
    { href: "/stations", label: "Stations" },
    { href: "/chef/ranks", label: "Ranks" },
  ],
} as const;

const todayStamp = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const items = user ? navByRole[user.role] : [];

  return (
    <html lang="en" className={`${fraunces.variable} ${geist.variable} ${jetbrains.variable}`}>
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="brand" style={{ textDecoration: "none" }}>
              <div className="brand-mark">C</div>
              <div className="brand-text">
                <span className="brand-name">Casebook</span>
                <span className="brand-sub">Police Case Management</span>
              </div>
            </Link>

            <nav className="topnav">
              {items.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="topbar-user">
              {user ? (
                <>
                  <div className="user-chip">
                    <span className="name">{user.username}</span>
                    <span className={`role-stamp role-${user.role}`}>{user.role}</span>
                  </div>
                  <form action={signOut}>
                    <button type="submit" className="secondary">Sign out</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="btn">Sign in</Link>
              )}
            </div>
          </div>
        </header>

        <div className="container">
          <span className="regmark tl" aria-hidden />
          <span className="regmark tr" aria-hidden />
          {children}
        </div>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <span>Casebook</span>
            <span>{todayStamp()}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
