"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginFormProps = {
  nextPath: string;
  configured: boolean;
};

export function LoginForm({ nextPath, configured }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("Configura Supabase prima di usare il login.");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 pt-[52px]">
      <form onSubmit={submit} className="grid w-full max-w-sm gap-4">
        <div>
          <h1 className="text-base font-semibold uppercase">Login</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Accesso riservato all’admin per modificare album e foto.
          </p>
        </div>

        {!configured ? (
          <p className="border border-neutral-200 px-3 py-2 text-sm leading-6 text-neutral-600">
            Supabase non e ancora configurato. Copia le variabili in .env.local e riavvia il sito.
          </p>
        ) : null}

        <label className="grid gap-1 text-xs uppercase text-neutral-500">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 border border-neutral-200 px-3 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
            disabled={!configured || loading}
          />
        </label>
        <label className="grid gap-1 text-xs uppercase text-neutral-500">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-10 border border-neutral-200 px-3 text-sm normal-case text-neutral-950 outline-none focus:border-neutral-800"
            disabled={!configured || loading}
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          className="h-10 border border-neutral-950 bg-neutral-950 px-4 text-xs uppercase text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!configured || loading}
        >
          {loading ? "Entro" : "Entra"}
        </button>
      </form>
    </main>
  );
}
