"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "../../lib/authClient";
import { getSignUpErrorMessage } from "../../lib/authErrors";
import {
  buildAuthHref,
  getAbsoluteCallbackURL,
  getSafeRedirectPath,
} from "../../lib/callbackUrl";
import { AuthShell } from "./AuthShell";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const callbackPath = getSafeRedirectPath(searchParams?.get("callback"));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const normalizedName = name.trim();
    if (!normalizedName) {
      setErrorMessage("Please enter your full name.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await authClient.signUp.email({
        name: normalizedName,
        email: email.trim().toLowerCase(),
        password,
        callbackURL: getAbsoluteCallbackURL(callbackPath),
      });

      if (error) {
        setErrorMessage(getSignUpErrorMessage(error));
        return;
      }

      router.replace(callbackPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(getSignUpErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your SyncSpace account and jump straight into collaborative workspaces."
      footerText="Already have an account?"
      footerHref={buildAuthHref("/login", callbackPath)}
      footerLinkLabel="Sign in"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Full name</span>
          <input
            type="text"
            autoComplete="name"
            required
            disabled={isSubmitting}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="Ashish Sharma"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="At least 8 characters"
          />
        </label>

        {errorMessage ? (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
