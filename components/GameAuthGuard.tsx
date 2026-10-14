"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { loginUser } from "@/lib/actions";
import { supabase } from "@/lib/supabase";

interface GameAuthGuardProps {
  children: ReactNode;
  gameName?: string;
}

export default function GameAuthGuard({
  children,
  gameName = "this game",
}: GameAuthGuardProps) {
  const [user, setUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session }, error: sessionError }) => {
        if (!mounted) return;
        if (sessionError) {
          console.error("Failed to check game access session:", sessionError);
        }
        setUser(session?.user ?? null);
        setCheckingSession(false);
      })
      .catch((sessionError) => {
        if (!mounted) return;
        console.error("Failed to check game access session:", sessionError);
        setUser(null);
        setCheckingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        if (!session) setError("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoggingIn(true);
    setError("");

    try {
      await loginUser(email.trim(), password);
      setPassword("");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f4effc] px-4">
        <p className="font-semibold text-[#5f2396]" role="status">
          Checking your login...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f4effc] px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-[#c7a6f3]/40 bg-white p-8 shadow-xl md:p-10">
          <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-[#5f2396]">
            GXC Arcade
          </p>
          <h1 className="mt-3 text-center text-3xl font-black text-[#220849]">
            Login Required
          </h1>
          <p className="mt-3 text-center leading-relaxed text-[#220849]/65">
            Sign in to your GXC Arcade account to access {gameName}.
          </p>

          {error && (
            <p
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold text-[#220849]">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#c7a6f3]/50 bg-white px-4 py-3 outline-none transition focus:border-[#5f2396] focus:ring-2 focus:ring-[#5f2396]/15"
                placeholder="you@example.com"
              />
            </label>

            <label className="block text-sm font-semibold text-[#220849]">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#c7a6f3]/50 bg-white px-4 py-3 outline-none transition focus:border-[#5f2396] focus:ring-2 focus:ring-[#5f2396]/15"
                placeholder="Enter your password"
              />
            </label>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-xl bg-[#5f2396] px-5 py-4 font-bold text-white transition hover:bg-[#220849] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingIn ? "Signing in..." : "Sign in to play"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#220849]/65">
            Need an account? Go to the{" "}
            <Link
              href="/"
              className="font-bold text-[#5f2396] underline underline-offset-4"
            >
              home page
            </Link>{" "}
            and use the registration option.
          </p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
