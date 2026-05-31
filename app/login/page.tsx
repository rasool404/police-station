"use client";

import { useActionState, useState } from "react";
import { signIn, type AuthState } from "@/app/actions/auth";

const DEMOS = [
  { role: "citizen", username: "citizen", password: "citizen123" },
  { role: "officer", username: "officer", password: "officer123" },
  { role: "chef",    username: "chef",    password: "chef123" },
] as const;

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    null,
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {DEMOS.map((d) => (
              <DemoButton
                key={d.role}
                role={d.role}
                username={d.username}
                password={d.password}
                active={username === d.username}
                onClick={() => {
                  setUsername(d.username);
                  setPassword(d.password);
                }}
              />
            ))}
          </div>
          <p className="mono faint" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 14, marginBottom: 0 }}>
            Click a role to autofill ↑
          </p>
        </div>
      </div>
    </div>
  );
}

function DemoButton({ role, username, password, active, onClick }:
  {
    role: "citizen" | "officer" | "chef";
    username: string;
    password: string;
    active: boolean;
    onClick: () => void;
  }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="demo-row"
      data-active={active}
    >
      <span className={`role-stamp role-${role}`}>{role}</span>
      <div className="mono" style={{ fontSize: 13, textAlign: "left" }}>
        {username} <span className="faint">/</span> {password}
      </div>
    </button>
  );
}
