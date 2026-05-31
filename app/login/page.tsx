"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    null,
  );

  return (
    <div style={{ maxWidth: 880, margin: "32px auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 32 }}>Sign in</h1>

      <div className="grid-asym" style={{ alignItems: "stretch" }}>
        <div className="dossier" style={{ padding: 32 }}>
          {state?.error && <div className="notice">{state.error}</div>}

          <form action={action} className="stack">
            <label>
              Username
              <input
                name="username"
                required
                autoComplete="username"
                autoFocus
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button type="submit" disabled={pending}>
                {pending ? "Verifying…" : "Sign in →"}
              </button>
            </div>
          </form>
        </div>

        <div className="dossier" style={{ padding: 24 }}>
          <span className="eyebrow">Demo accounts</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            <DemoRow role="citizen" username="citizen" password="citizen123" />
            <DemoRow role="officer" username="officer" password="officer123" />
            <DemoRow role="chef"    username="chef"    password="chef123" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoRow({ role, username, password }:
  { role: "citizen" | "officer" | "chef"; username: string; password: string }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: 12,
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid var(--rule)",
    }}>
      <span className={`role-stamp role-${role}`}>{role}</span>
      <div className="mono" style={{ fontSize: 13 }}>
        {username} <span className="faint">/</span> {password}
      </div>
    </div>
  );
}
