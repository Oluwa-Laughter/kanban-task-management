"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type AuthState } from "../actions";

const initial: AuthState = { error: null };

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(signInAction, initial);

  return (
    <>
      <h1 className="text-heading-l text-black dark:text-white">Sign in</h1>
      <p className="mt-2 text-medium-grey">
        Welcome back. Sign in to manage your boards.
      </p>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input mt-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input mt-2"
            placeholder="••••••••"
          />
        </div>
        {state.error ? (
          <p className="text-body-l font-medium text-red">{state.error}</p>
        ) : null}
        <button type="submit" disabled={pending} className="btn-primary-large w-full">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-medium-grey">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-bold text-purple hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
