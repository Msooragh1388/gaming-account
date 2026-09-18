"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Game = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
};

function createSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06ff-]/g, "");
}

export default function GamesAdminPage() {
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [newGameName, setNewGameName] = useState("");
  const [addingGame, setAddingGame] = useState(false);

  async function loadGames() {
    setLoading(true);

    const { data, error } = await supabase
      .from("Game")
      .select("*")
      .order("createdAt", {
        ascending: true,
      });

    if (error) {
      console.error(error);

      setMessage(
        `خطا در دریافت بازی‌ها: ${error.message}`
      );

      setLoading(false);
      return;
    }

    setGames(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadGames();
  }, []);

  async function handleAddGame(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanName = newGameName.trim();

    if (!cleanName) {
      setMessage("نام بازی را وارد کن.");
      return;
    }

    const slug = createSlug(cleanName);

    if (!slug) {
      setMessage("نام بازی معتبر نیست.");
      return;
    }

    setAddingGame(true);
    setMessage("");

    const { data, error } = await supabase
      .from("Game")
      .insert({
        name: cleanName,
        slug,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        setMessage("این بازی قبلاً وجود دارد.");
      } else {
        setMessage(
          `خطا در اضافه کردن بازی: ${error.message}`
        );
      }

      setAddingGame(false);
      return;
    }

    if (data) {
      setGames((current) => [
        ...current,
        data,
      ]);
    }

    setNewGameName("");

    setMessage(
      `بازی «${cleanName}» با موفقیت اضافه شد.`
    );

    setAddingGame(false);
  }

  async function toggleGame(game: Game) {
    setMessage("");

    const { error } = await supabase
      .from("Game")
      .update({
        active: !game.active,
      })
      .eq("id", game.id);

    if (error) {
      console.error(error);

      setMessage(
        `خطا در تغییر وضعیت بازی: ${error.message}`
      );

      return;
    }

    setGames((current) =>
      current.map((item) =>
        item.id === game.id
          ? {
              ...item,
              active: !item.active,
            }
          : item
      )
    );

    setMessage(
      game.active
        ? `بازی «${game.name}» غیرفعال شد.`
        : `بازی «${game.name}» فعال شد.`
    );
  }

  async function deleteGame(game: Game) {
    const confirmed = window.confirm(
      `آیا مطمئنی می‌خواهی بازی «${game.name}» را حذف کنی؟`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    const { error } = await supabase
      .from("Game")
      .delete()
      .eq("id", game.id);

    if (error) {
      console.error(error);

      setMessage(
        `خطا در حذف بازی: ${error.message}`
      );

      return;
    }

    setGames((current) =>
      current.filter(
        (item) => item.id !== game.id
      )
    );

    setMessage(
      `بازی «${game.name}» حذف شد.`
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07070a] text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black">
              مدیریت بازی‌ها
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              افزودن و مدیریت بازی‌های سایت
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10"
          >
            ← بازگشت به پنل مدیریت
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm">
            {message}
          </div>
        )}

        {/* ADD GAME */}
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-black">
            افزودن بازی
          </h2>

          <form
            onSubmit={handleAddGame}
            className="flex flex-col gap-3 md:flex-row"
          >
            <input
              value={newGameName}
              onChange={(event) =>
                setNewGameName(event.target.value)
              }
              placeholder="نام بازی"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#101014] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-white/20"
            />

            <button
              type="submit"
              disabled={addingGame}
              className="rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addingGame
                ? "در حال افزودن..."
                : "+ افزودن بازی"}
            </button>
          </form>
        </section>

        {/* GAMES */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">
              بازی‌ها
            </h2>

            <button
              type="button"
              onClick={loadGames}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
            >
              ↻ بروزرسانی
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
              در حال دریافت بازی‌ها...
            </div>
          ) : games.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
              هنوز هیچ بازی‌ای اضافه نشده است.
            </div>
          ) : (
            <div className="grid gap-4">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-black">
                        {game.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {game.slug}
                      </p>

                      <p
                        className={`mt-2 text-sm font-bold ${
                          game.active
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {game.active
                          ? "فعال"
                          : "غیرفعال"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggleGame(game)
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
                      >
                        {game.active
                          ? "غیرفعال کردن"
                          : "فعال کردن"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteGame(game)
                        }
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}