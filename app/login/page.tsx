"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    null,
  );

  return (
    <div style={{ maxWidth: 380, margin: "60px auto" }}>
      <h1>Sign in</h1>
      {state?.error && <div className="error">{state.error}</div>}
      <form action={action} className="stack card">
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
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
        <button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
        No account? <Link href="/signup">Create one</Link>
      </p>
    </div>
  );
}
