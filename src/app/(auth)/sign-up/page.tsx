"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthState } from "../actions";

const initial: AuthState = { error: null };

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initial);

  return (
    <>
      <h1 className="text-heading-l text-black dark:text-white">Create account</h1>
      <p className="mt-2 text-medium-grey">
        Start organising your work. Create your first board to get started.
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
            autoComplete="new-password"
            required
            minLength={6}
            className="input mt-2"
            placeholder="At least 6 characters"
          />
        </div>
        {state.error ? (
          <p role="alert" className="text-body-l font-medium text-red">{state.error}</p>
        ) : null}
        <button type="submit" disabled={pending} className="btn-primary-large w-full">
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-center text-medium-grey">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-bold text-purple hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
