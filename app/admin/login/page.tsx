
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!password) {
      setError("رمز عبور را وارد کن.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error || "رمز عبور اشتباه است."
        );
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "خطا در اتصال به سرور. دوباره تلاش کن."
      );

      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#07070a] px-4 text-white"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl">
            🔐
          </div>

          <h1 className="text-2xl font-black">
            ورود به پنل مدیریت
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            برای ورود رمز عبور مدیریت را وارد کن.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-bold">
              رمز عبور
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="رمز عبور پنل"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "در حال ورود..."
              : "ورود به پنل"}
          </button>
        </form>
      </div>
    </main>
  );
}
