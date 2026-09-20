
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  game: string;
  title: string;
  description: string | null;
  price: number;
  images: string[] | null;
  videoUrl: string | null;
  isSold: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
};

function BookmarkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4.75C6 3.7835 6.7835 3 7.75 3H16.25C17.2165 3 18 3.7835 18 4.75V21L12 17.5L6 21V4.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 5L16 12L9 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7H19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7 7L7.8 19C7.87 20.12 8.8 21 9.92 21H14.08C15.2 21 16.13 20.12 16.2 19L17 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 11V17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14 11V17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SavedAccountsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSavedProducts();
  }, []);

  async function loadSavedProducts() {
    setLoading(true);
    setError("");

    try {
      const savedRaw = localStorage.getItem(
        "gaming_account_saved"
      );

      if (!savedRaw) {
        setProducts([]);
        return;
      }

      let savedIds: number[] = [];

      try {
        const parsed = JSON.parse(savedRaw);

        if (Array.isArray(parsed)) {
          savedIds = parsed
            .map((id) => Number(id))
            .filter(
              (id) =>
                Number.isInteger(id) && id > 0
            );
        }
      } catch {
        savedIds = [];
      }

      if (savedIds.length === 0) {
        setProducts([]);
        return;
      }

      const { data, error } = await supabase
        .from("ProductPublic")
        .select(
          "id, game, title, description, price, images, videoUrl, isSold, likes, createdAt, updatedAt"
        )
        .in("id", savedIds);

      if (error) {
        console.error(
          "Saved products error:",
          error
        );

        throw new Error(
          "دریافت اکانت‌های ذخیره‌شده ناموفق بود."
        );
      }

      const loadedProducts = (data ||
        []) as Product[];

      const sortedProducts = savedIds
        .map((id) =>
          loadedProducts.find(
            (product) =>
              Number(product.id) === id
          )
        )
        .filter(
          (
            product
          ): product is Product =>
            Boolean(product)
        );

      const existingIds = loadedProducts.map(
        (product) => Number(product.id)
      );

      const cleanedIds = savedIds.filter(
        (id) => existingIds.includes(id)
      );

      if (
        cleanedIds.length !==
        savedIds.length
      ) {
        localStorage.setItem(
          "gaming_account_saved",
          JSON.stringify(cleanedIds)
        );
      }

      setProducts(sortedProducts);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "خطایی در دریافت اکانت‌های ذخیره‌شده رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  function removeSaved(productId: number) {
    try {
      const savedRaw = localStorage.getItem(
        "gaming_account_saved"
      );

      let savedIds: number[] = [];

      if (savedRaw) {
        try {
          const parsed = JSON.parse(
            savedRaw
          );

          if (Array.isArray(parsed)) {
            savedIds = parsed
              .map((id) => Number(id))
              .filter(
                (id) =>
                  Number.isInteger(id) &&
                  id > 0
              );
          }
        } catch {
          savedIds = [];
        }
      }

      const newIds = savedIds.filter(
        (id) =>
          id !== Number(productId)
      );

      localStorage.setItem(
        "gaming_account_saved",
        JSON.stringify(newIds)
      );

      setProducts((current) =>
        current.filter(
          (product) =>
            Number(product.id) !==
            Number(productId)
        )
      );

      setMessage(
        "اکانت از ذخیره‌شده‌ها حذف شد."
      );
    } catch (err) {
      console.error(err);

      setError(
        "حذف اکانت ذخیره‌شده ناموفق بود."
      );
    }
  }

  function openProduct(productId: number) {
    window.location.href =
      `/product/${productId}`;
  }

  function goBack() {
    window.location.href = "/profile";
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat(
      "fa-IR"
    ).format(price);
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-950 px-4 py-10 text-white"
      >
        <div className="mx-auto max-w-2xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-white" />

              <p className="mt-4 text-xs text-slate-500">
                در حال دریافت اکانت‌های ذخیره‌شده...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 px-4 py-7 pb-16 text-white"
    >
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
            aria-label="بازگشت"
          >
            →
          </button>

          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200">
                <BookmarkIcon />
              </div>
            </div>

            <h1 className="mt-3 text-lg font-bold">
              اکانت‌های ذخیره‌شده
            </h1>

            <p className="mt-1 text-[11px] text-slate-600">
              اکانت‌هایی که برای بعد ذخیره کرده‌ای
            </p>
          </div>

          <div className="w-9" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-center text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Empty */}
        {products.length === 0 ? (
          <section className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-7 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-slate-500">
              <BookmarkIcon />
            </div>

            <h2 className="mt-4 text-sm font-bold">
              هنوز اکانتی ذخیره نکرده‌ای
            </h2>

            <p className="mt-2 text-xs leading-6 text-slate-600">
              وقتی یک اکانت را ذخیره کنی،
              از اینجا می‌توانی دوباره آن را ببینی.
            </p>

            <button
              type="button"
              onClick={() =>
                (window.location.href = "/")
              }
              className="mt-5 w-full rounded-xl bg-white py-3 text-xs font-bold text-slate-950 transition hover:bg-slate-200 active:scale-[0.99]"
            >
              رفتن به فروشگاه
            </button>
          </section>
        ) : (
          <>
            {/* Count */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-slate-600">
                {products.length.toLocaleString(
                  "fa-IR"
                )}{" "}
                اکانت ذخیره‌شده
              </p>
            </div>

            {/* Products */}
            <div className="space-y-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/70 shadow-lg"
                >
                  <div className="flex gap-3 p-3">
                    {/* Image */}
                    <button
                      type="button"
                      onClick={() =>
                        openProduct(
                          product.id
                        )
                      }
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-800/70"
                    >
                      {product.images &&
                      product.images.length >
                        0 ? (
                        <img
                          src={
                            product.images[0]
                          }
                          alt={product.title}
                          className="h-full w-full object-cover transition hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-600">
                          بدون تصویر
                        </div>
                      )}
                    </button>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openProduct(
                              product.id
                            )
                          }
                          className="min-w-0 text-right"
                        >
                          <h2 className="line-clamp-2 text-sm font-bold leading-5 transition hover:text-slate-300">
                            {product.title}
                          </h2>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeSaved(
                              product.id
                            )
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/[0.06] text-red-400/70 transition hover:bg-red-500/10 hover:text-red-300"
                          aria-label="حذف از ذخیره‌شده‌ها"
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      <p className="mt-1.5 text-[11px] text-slate-600">
                        {product.game}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-300">
                          {formatPrice(
                            product.price
                          )}{" "}
                          تومان
                        </p>

                        {product.isSold ? (
                          <span className="rounded-lg bg-red-500/[0.06] px-2.5 py-1.5 text-[10px] font-bold text-red-300/80">
                            فروخته شده
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              openProduct(
                                product.id
                              )
                            }
                            className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
                          >
                            مشاهده
                            <ArrowIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Back */}
        <button
          type="button"
          onClick={goBack}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] py-3 text-xs font-medium text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300"
        >
          <span>→</span>
          بازگشت به پروفایل
        </button>

        {/* Toast */}
        {message && (
          <div className="fixed bottom-6 left-1/2 z-[300] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-xs font-medium text-white shadow-2xl backdrop-blur">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}