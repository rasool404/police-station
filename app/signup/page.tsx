"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUp,
    null,
  );

  return (
    <div style={{ maxWidth: 380, margin: "60px auto" }}>
      <h1>Create account</h1>
      <p className="muted">
        New accounts are created as <strong>citizens</strong>. Officer and
        admin roles are assigned by an administrator.
      </p>
      {state?.error && <div className="error">{state.error}</div>}
      <form action={action} className="stack card">
        <label>
          Full name
          <input name="name" required autoComplete="name" />
        </label>
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
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
