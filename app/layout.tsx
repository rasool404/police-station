import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Police Station Admin",
  description: "Course project — Supabase + Next.js",
};

const navByRole = {
  citizen: [
    { href: "/", label: "Home" },
    { href: "/report/new", label: "File report" },
    { href: "/report/mine", label: "My reports" },
  ],
  officer: [
    { href: "/", label: "Dashboard" },
    { href: "/stations", label: "Stations" },
    { href: "/departments", label: "Departments" },
    { href: "/officers", label: "Officers" },
    { href: "/persons", label: "Persons" },
    { href: "/complaints", label: "Complaints" },
    { href: "/cases", label: "Cases" },
  ],
  admin: [
    { href: "/", label: "Dashboard" },
    { href: "/stations", label: "Stations" },
    { href: "/departments", label: "Departments" },
    { href: "/officers", label: "Officers" },
    { href: "/persons", label: "Persons" },
    { href: "/complaints", label: "Complaints" },
    { href: "/cases", label: "Cases" },
    { href: "/admin/ranks", label: "Ranks" },
  ],
} as const;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const items = user ? navByRole[user.role] : [];

  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="brand">🛡️ Police Station</div>
          <nav>
            {items.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            {user ? (
              <>
                <span className="muted" style={{ fontSize: 12 }}>
                  {user.email} <span className={`badge badge-${user.role}`}>{user.role}</span>
                </span>
                <form action={signOut}>
                  <button type="submit" className="secondary">Sign out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">Sign in</Link>
                <Link href="/signup"><button>Sign up</button></Link>
              </>
            )}
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
