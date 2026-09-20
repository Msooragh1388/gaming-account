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
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4.75C6 3.7835 6.7835 3 7.75 3H16.25C17.2165 3 18 3.7835 18 4.75V21L12 17.5L6 21V4.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
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
      className="h-5 w-5"
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
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 7L7.8 19C7.87 20.12 8.8 21 9.92 21H14.08C15.2 21 16.13 20.12 16.2 19L17 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 11V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 11V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SavedAccountsPage() {
  const [products, setProducts] = useState<Product[]>(
    []
  );

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
      const savedRaw =
        localStorage.getItem(
          "gaming_account_saved"
        );

      if (!savedRaw) {
        setProducts([]);
        return;
      }

      let savedIds: number[] = [];

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

      if (savedIds.length === 0) {
        setProducts([]);
        return;
      }

      const { data, error } =
        await supabase
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

      const loadedProducts =
        (data || []) as Product[];

      // ترتیب را مطابق ترتیب ذخیره‌شدن نگه می‌داریم
      const sortedProducts =
        savedIds
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

      // اگر بعضی محصولات دیگر وجود نداشته باشند،
      // آن‌ها را از localStorage پاک می‌کنیم.
      const existingIds =
        loadedProducts.map(
          (product) => Number(product.id)
        );

      const cleanedIds =
        savedIds.filter((id) =>
          existingIds.includes(id)
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
      const savedRaw =
        localStorage.getItem(
          "gaming_account_saved"
        );

      let savedIds: number[] = [];

      if (savedRaw) {
        try {
          const parsed =
            JSON.parse(savedRaw);

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

      const newIds =
        savedIds.filter(
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
    window.location.href =
      "/profile";
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
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

              <p className="mt-4 text-sm text-slate-400">
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
      className="min-h-screen bg-slate-950 px-4 py-8 pb-12 text-white"
    >
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-white/10"
            aria-label="بازگشت"
          >
            →
          </button>

          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950">
                <BookmarkIcon />
              </div>
            </div>

            <h1 className="mt-3 text-xl font-black">
              اکانت‌های ذخیره‌شده
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              اکانت‌هایی که برای بعد ذخیره کرده‌ای
            </p>
          </div>

          <div className="w-10" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty */}
        {products.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
              <BookmarkIcon />
            </div>

            <h2 className="mt-5 text-lg font-black">
              هنوز اکانتی ذخیره نکرده‌ای
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              وقتی یک اکانت را ذخیره کنی،
              از اینجا می‌توانی دوباره آن را ببینی.
            </p>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/")
              }
              className="mt-6 w-full rounded-2xl bg-white py-3.5 font-black text-slate-950 transition hover:bg-slate-200"
            >
              رفتن به فروشگاه
            </button>
          </section>
        ) : (
          <>
            {/* Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                {products.length.toLocaleString(
                  "fa-IR"
                )}{" "}
                اکانت ذخیره‌شده
              </p>
            </div>

            {/* Products */}
            <div className="space-y-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl"
                >
                  <div className="flex gap-4 p-4">
                    {/* Image */}
                    <button
                      type="button"
                      onClick={() =>
                        openProduct(
                          product.id
                        )
                      }
                      className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-800"
                    >
                      {product.images &&
                      product.images.length >
                        0 ? (
                        <img
                          src={
                            product
                              .images[0]
                          }
                          alt={
                            product.title
                          }
                          className="h-full w-full object-cover transition hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
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
                          <h2 className="line-clamp-2 font-black leading-6 transition hover:text-slate-300">
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
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                          aria-label="حذف از ذخیره‌شده‌ها"
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {product.game}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-white">
                          {formatPrice(
                            product.price
                          )}{" "}
                          تومان
                        </p>

                        {product.isSold ? (
                          <span className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">
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
                            className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-slate-200"
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
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900 py-3.5 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <span>→</span>
          بازگشت به پروفایل
        </button>

        {/* Toast */}
        {message && (
          <div className="fixed bottom-6 left-1/2 z-[300] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white shadow-2xl">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}