"use client";

import { useActionState, useState } from "react";
import { signIn, type AuthState } from "@/app/actions/auth";

export type DemoUser = {
  role: "citizen" | "officer" | "chef";
  username: string;
  password: string;
};

export function LoginForm({ demos }: { demos: DemoUser[] }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const columns: { role: DemoUser["role"]; label: string; rows: DemoUser[] }[] = [
    { role: "citizen", label: "Citizens", rows: demos.filter((d) => d.role === "citizen") },
    { role: "officer", label: "Officers", rows: demos.filter((d) => d.role === "officer") },
    { role: "chef",    label: "Chief",    rows: demos.filter((d) => d.role === "chef")    },
  ];

  function pick(d: DemoUser) {
    setUsername(d.username);
    setPassword(d.password);
  }

  return (
    <div style={{ maxWidth: 880, margin: "32px auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 32 }}>Sign in</h1>

      <div className="dossier" style={{ padding: 32, maxWidth: 460, margin: "0 auto" }}>
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

      <details className="dossier demo-accordion" style={{ padding: 0, marginTop: 24 }}>
        <summary>
          <span>Demo accounts</span>
          <span className="mono faint" style={{ fontSize: 11, letterSpacing: "0.18em" }}>{demos.length} total</span>
        </summary>

        <div className="demo-columns">
          {columns.map((col) => (
            <div key={col.role} className="demo-col">
              <div className="demo-col-head">
                <span className={`role-stamp role-${col.role}`}>{col.role}</span>
                <span className="mono faint" style={{ fontSize: 10.5, letterSpacing: "0.18em" }}>{col.rows.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {col.rows.map((d) => (
                  <button
                    key={d.username}
                    type="button"
                    className="demo-row"
                    data-active={username === d.username}
                    onClick={() => pick(d)}
                    style={{ padding: "7px 10px", gridTemplateColumns: "1fr", gap: 0 }}
                  >
                    <div className="mono" style={{ fontSize: 12, textAlign: "left" }}>
                      {d.username} <span className="faint">/</span> {d.password}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
