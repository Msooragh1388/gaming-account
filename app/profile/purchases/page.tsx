
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Purchase = {
  id: number;
  productId: number;
  productTitle: string;
  game: string;
  accountUsername: string;
  accountPassword: string;
  backupPassword1: string | null;
  backupPassword2: string | null;
  price: number;
  createdAt: string;
};

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

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 4H5L7.2 15.2C7.39 16.17 8.24 16.87 9.23 16.87H17.5C18.4 16.87 19.19 16.27 19.31 15.38L20.5 8H6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17.5" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4.5 w-4.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      {visible ? (
        <>
          <path
            d="M2.5 12C4.2 8.4 7.6 6 12 6C16.4 6 19.8 8.4 21.5 12C19.8 15.6 16.4 18 12 18C7.6 18 4.2 15.6 2.5 12Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </>
      ) : (
        <>
          <path
            d="M3 3L21 21"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M10.6 6.2C11.05 6.07 11.52 6 12 6C16.4 6 19.8 8.4 21.5 12C20.85 13.37 19.93 14.58 18.82 15.55"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.12 7.15C4.56 8.22 3.31 9.88 2.5 12C4.2 15.6 7.6 18 12 18C13.43 18 14.75 17.72 15.93 17.21"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4.5 w-4.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M16 8V6.5C16 5.67 15.33 5 14.5 5H6.5C5.67 5 5 5.67 5 6.5V14.5C5 15.33 5.67 16 6.5 16H8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.84 8.61C20.84 5.95 18.69 4 16.05 4C14.48 4 13.07 4.76 12 5.95C10.93 4.76 9.52 4 7.95 4C5.31 4 3.16 5.95 3.16 8.61C3.16 12.02 6.27 14.83 12 20C17.73 14.83 20.84 12.02 20.84 8.61Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4.75C6 3.78 6.78 3 7.75 3H16.25C17.22 3 18 3.78 18 4.75V21L12 17.5L6 21V4.75Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type MediaItem =
  | {
      type: "image";
      url: string;
    }
  | {
      type: "video";
      url: string;
    };

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [visiblePasswords, setVisiblePasswords] =
    useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [selectedMedia, setSelectedMedia] = useState(0);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [liking, setLiking] = useState(false);

  const [savedIds, setSavedIds] = useState<number[]>([]);

  useEffect(() => {
    loadPurchases();
    loadUserLikes();
    loadSavedProducts();
  }, []);

  async function loadPurchases() {
    setLoading(true);
    setError("");

    const token = localStorage.getItem(
      "gaming_account_token"
    );

    if (!token) {
      window.location.href = "/profile";
      return;
    }

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "دریافت خریدها ناموفق بود."
        );
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.purchases)
        ? data.purchases
        : [];

      setPurchases(list as Purchase[]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "خطایی در دریافت اکانت‌های خریداری‌شده رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadUserLikes() {
    const token = localStorage.getItem(
      "gaming_account_token"
    );

    if (!token) return;

    try {
      const response = await fetch("/api/likes/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });

      if (!response.ok) return;

      const data = await response.json();

      const ids: number[] = Array.isArray(data)
        ? data
            .map((item: unknown) => {
              if (typeof item === "number") return item;

              if (
                typeof item === "object" &&
                item !== null &&
                "productId" in item
              ) {
                return Number(
                  (item as { productId: unknown }).productId
                );
              }

              return NaN;
            })
            .filter((id: number) => Number.isFinite(id))
        : Array.isArray(data?.productIds)
        ? data.productIds
            .map((id: unknown) => Number(id))
            .filter((id: number) => Number.isFinite(id))
        : [];

      const likeMap: Record<number, boolean> = {};

      ids.forEach((id) => {
        likeMap[id] = true;
      });

      setLiked(likeMap);
    } catch (err) {
      console.error("loadUserLikes error:", err);
    }
  }

  function loadSavedProducts() {
    try {
      const raw = localStorage.getItem(
        "gaming_account_saved"
      );

      if (!raw) {
        setSavedIds([]);
        return;
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        setSavedIds([]);
        return;
      }

      const ids = parsed
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));

      setSavedIds(ids);
    } catch (err) {
      console.error("loadSavedProducts error:", err);
      setSavedIds([]);
    }
  }

  async function toggleLike(productId: number) {
    if (liking) return;

    const token = localStorage.getItem(
      "gaming_account_token"
    );

    if (!token) {
      window.location.href = "/profile";
      return;
    }

    setLiking(true);
    setError("");

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "تغییر وضعیت لایک انجام نشد."
        );
      }

      const isLiked =
        typeof data?.liked === "boolean"
          ? data.liked
          : !Boolean(liked[productId]);

      const likes =
        typeof data?.likes === "number"
          ? data.likes
          : selectedProduct?.id === productId
          ? selectedProduct.likes +
            (isLiked ? 1 : -1)
          : undefined;

      setLiked((current) => ({
        ...current,
        [productId]: isLiked,
      }));

      if (selectedProduct?.id === productId) {
        setSelectedProduct((current) =>
          current
            ? {
                ...current,
                likes:
                  typeof likes === "number"
                    ? Math.max(0, likes)
                    : current.likes,
              }
            : current
        );
      }

      if (isLiked) {
        setMessage("اکانت به علاقه‌مندی‌ها اضافه شد.");
      } else {
        setMessage("لایک اکانت برداشته شد.");
      }

      setTimeout(() => {
        setMessage("");
      }, 1800);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "تغییر وضعیت لایک انجام نشد."
      );
    } finally {
      setLiking(false);
    }
  }

  function toggleSave(productId: number) {
    try {
      const raw = localStorage.getItem(
        "gaming_account_saved"
      );

      let ids: number[] = [];

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          ids = parsed
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id));
        }
      }

      const alreadySaved = ids.includes(productId);

      const nextIds = alreadySaved
        ? ids.filter((id) => id !== productId)
        : [...ids, productId];

      localStorage.setItem(
        "gaming_account_saved",
        JSON.stringify(nextIds)
      );

      setSavedIds(nextIds);

      setMessage(
        alreadySaved
          ? "اکانت از ذخیره‌شده‌ها حذف شد."
          : "اکانت ذخیره شد."
      );

      setTimeout(() => {
        setMessage("");
      }, 1800);
    } catch (err) {
      console.error(err);
      setError("ذخیره اکانت انجام نشد.");
    }
  }

  function togglePassword(purchaseId: number) {
    setVisiblePasswords((current) => ({
      ...current,
      [purchaseId]: !current[purchaseId],
    }));
  }

  async function copyText(
    text: string,
    successMessage: string
  ) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(successMessage);

      setTimeout(() => {
        setMessage("");
      }, 1800);
    } catch {
      setError("کپی کردن انجام نشد.");
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("fa-IR").format(price);
  }

  function formatDate(dateString: string) {
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  }

  function goBack() {
    window.location.href = "/profile";
  }

  async function openProduct(productId: number) {
    setLoadingProduct(true);
    setError("");
    setSelectedMedia(0);

    try {
      const { data, error: supabaseError } = await supabase
        .from("ProductPublic")
        .select(
          "id, game, title, description, price, images, videoUrl, isSold, likes, createdAt, updatedAt"
        )
        .eq("id", productId)
        .maybeSingle();

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data) {
        throw new Error(
          "اطلاعات این اکانت دیگر در فروشگاه موجود نیست."
        );
      }

      setSelectedProduct(data as Product);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "دریافت اطلاعات اکانت ناموفق بود."
      );
    } finally {
      setLoadingProduct(false);
    }
  }

  function closeProduct() {
    setSelectedProduct(null);
    setSelectedMedia(0);
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-950 px-4 py-8 text-white"
      >
        <div className="mx-auto max-w-2xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-slate-800 border-t-slate-300" />

              <p className="mt-4 text-xs text-slate-500">
                در حال دریافت خریدهای شما...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const mediaItems: MediaItem[] = selectedProduct
    ? [
        ...(selectedProduct.images ?? [])
          .filter(Boolean)
          .map((url) => ({
            type: "image" as const,
            url,
          })),
        ...(selectedProduct.videoUrl
          ? [
              {
                type: "video" as const,
                url: selectedProduct.videoUrl,
              },
            ]
          : []),
      ]
    : [];

  const currentMedia = mediaItems[selectedMedia];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 px-4 py-7 pb-28 text-white"
    >
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="بازگشت"
          >
            →
          </button>

          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-950 shadow-lg shadow-black/10">
                <CartIcon />
              </div>
            </div>

            <h1 className="mt-3 text-lg font-black">
              اکانت‌های خریداری‌شده
            </h1>

            <p className="mt-1 text-[11px] text-slate-500">
              مشاهده خریدها و اطلاعات اکانت‌ها
            </p>
          </div>

          <div className="w-9" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/15 bg-red-500/[0.07] px-4 py-3 text-xs leading-5 text-red-300">
            {error}
          </div>
        )}

        {/* Empty */}
        {purchases.length === 0 ? (
          <section className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-7 text-center shadow-lg shadow-black/10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800/80 text-slate-500">
              <CartIcon />
            </div>

            <h2 className="mt-4 text-base font-black">
              هنوز خریدی انجام نداده‌ای
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500">
              بعد از خرید یک اکانت، اطلاعات آن از اینجا
              قابل مشاهده خواهد بود.
            </p>

            <button
              type="button"
              onClick={() =>
                (window.location.href = "/")
              }
              className="mt-5 w-full rounded-xl bg-slate-100 py-3 text-sm font-black text-slate-950 transition hover:bg-white"
            >
              رفتن به فروشگاه
            </button>
          </section>
        ) : (
          <>
            {/* Count */}
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-xs text-slate-500">
                {purchases.length.toLocaleString("fa-IR")} خرید
              </p>
            </div>

            {/* Purchases */}
            <div className="space-y-4">
              {purchases.map((purchase) => {
                const passwordVisible = Boolean(
                  visiblePasswords[purchase.id]
                );

                return (
                  <article
                    key={purchase.id}
                    className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/70 shadow-lg shadow-black/10"
                  >
                    {/* Purchase header */}
                    <div className="border-b border-white/[0.06] p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-950">
                          <CartIcon />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="text-sm font-black leading-6">
                            {purchase.productTitle}
                          </h2>

                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {purchase.game}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-800/70 p-3">
                          <p className="text-[10px] text-slate-500">
                            مبلغ خرید
                          </p>

                          <p className="mt-1 text-xs font-black">
                            {formatPrice(purchase.price)} تومان
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-800/70 p-3">
                          <p className="text-[10px] text-slate-500">
                            تاریخ خرید
                          </p>

                          <p className="mt-1 text-[11px] font-bold text-slate-300">
                            {formatDate(purchase.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Account information */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="text-sm font-black">
                          اطلاعات اکانت
                        </h3>

                        <p className="mt-1 text-[11px] text-slate-500">
                          اطلاعات ورود خریداری‌شده
                        </p>
                      </div>

                      {/* Username */}
                      <div className="rounded-xl border border-white/[0.06] bg-slate-800/60 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-500">
                              نام کاربری
                            </p>

                            <p
                              dir="ltr"
                              className="mt-1.5 truncate text-xs font-bold text-slate-200"
                            >
                              {purchase.accountUsername}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                purchase.accountUsername,
                                "نام کاربری کپی شد."
                              )
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700/70 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                            aria-label="کپی نام کاربری"
                          >
                            <CopyIcon />
                          </button>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="mt-2 rounded-xl border border-white/[0.06] bg-slate-800/60 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-slate-500">
                              رمز عبور
                            </p>

                            <p
                              dir="ltr"
                              className="mt-1.5 truncate text-xs font-bold tracking-wider text-slate-200"
                            >
                              {passwordVisible
                                ? purchase.accountPassword
                                : "••••••••••••"}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                togglePassword(purchase.id)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/70 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                              aria-label={
                                passwordVisible
                                  ? "مخفی کردن رمز"
                                  : "نمایش رمز"
                              }
                            >
                              <EyeIcon
                                visible={passwordVisible}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                copyText(
                                  purchase.accountPassword,
                                  "رمز عبور کپی شد."
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/70 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                              aria-label="کپی رمز عبور"
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Backup password 1 */}
                      {purchase.backupPassword1 && (
                        <div className="mt-2 rounded-xl border border-white/[0.06] bg-slate-800/60 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-500">
                                رمز پشتیبان ۱
                              </p>

                              <p
                                dir="ltr"
                                className="mt-1.5 truncate text-xs font-bold tracking-wider text-slate-200"
                              >
                                {passwordVisible
                                  ? purchase.backupPassword1
                                  : "••••••••••••"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                copyText(
                                  purchase.backupPassword1!,
                                  "رمز پشتیبان ۱ کپی شد."
                                )
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700/70 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                              aria-label="کپی رمز پشتیبان ۱"
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Backup password 2 */}
                      {purchase.backupPassword2 && (
                        <div className="mt-2 rounded-xl border border-white/[0.06] bg-slate-800/60 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-500">
                                رمز پشتیبان ۲
                              </p>

                              <p
                                dir="ltr"
                                className="mt-1.5 truncate text-xs font-bold tracking-wider text-slate-200"
                              >
                                {passwordVisible
                                  ? purchase.backupPassword2
                                  : "••••••••••••"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                copyText(
                                  purchase.backupPassword2!,
                                  "رمز پشتیبان ۲ کپی شد."
                                )
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700/70 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                              aria-label="کپی رمز پشتیبان ۲"
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Product button */}
                      <button
                        type="button"
                        onClick={() =>
                          openProduct(purchase.productId)
                        }
                        disabled={loadingProduct}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-slate-800/70 py-3 text-xs font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-wait disabled:opacity-50"
                      >
                        {loadingProduct
                          ? "در حال دریافت اطلاعات..."
                          : "مشاهده صفحه اکانت"}

                        {!loadingProduct && <ArrowIcon />}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* Back */}
        <button
          type="button"
          onClick={goBack}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-slate-900/60 py-3 text-xs font-bold text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <span>→</span>
          بازگشت به پروفایل
        </button>

        {/* Product Modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={closeProduct}
          >
            <div
              dir="rtl"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-slate-900 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] p-4">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-black">
                    {selectedProduct.title}
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {selectedProduct.game}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* Like */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleLike(selectedProduct.id)
                    }
                    disabled={liking}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      liked[selectedProduct.id]
                        ? "bg-red-500/10 text-red-400"
                        : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.09] hover:text-red-400"
                    } disabled:cursor-wait disabled:opacity-50`}
                    aria-label={
                      liked[selectedProduct.id]
                        ? "برداشتن لایک"
                        : "لایک"
                    }
                  >
                    <HeartIcon
                      filled={Boolean(
                        liked[selectedProduct.id]
                      )}
                    />
                  </button>

                  {/* Save */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleSave(selectedProduct.id)
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      savedIds.includes(selectedProduct.id)
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.09] hover:text-amber-400"
                    }`}
                    aria-label={
                      savedIds.includes(selectedProduct.id)
                        ? "حذف از ذخیره‌شده‌ها"
                        : "ذخیره اکانت"
                    }
                  >
                    <BookmarkIcon
                      filled={savedIds.includes(
                        selectedProduct.id
                      )}
                    />
                  </button>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={closeProduct}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-400 transition hover:bg-white/[0.09] hover:text-white"
                    aria-label="بستن"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Gallery */}
              {mediaItems.length > 0 && (
                <div className="p-4">
                  {/* Main media */}
                  <div className="relative overflow-hidden rounded-2xl bg-slate-800">
                    {currentMedia?.type === "video" ? (
                      <video
                        key={currentMedia.url}
                        src={currentMedia.url}
                        controls
                        playsInline
                        className="max-h-[360px] w-full bg-black object-contain"
                      />
                    ) : currentMedia?.type === "image" ? (
                      <img
                        src={currentMedia.url}
                        alt={selectedProduct.title}
                        className="max-h-[360px] w-full object-contain"
                      />
                    ) : null}
                  </div>

                  {/* Gallery thumbnails */}
                  {mediaItems.length > 1 && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {mediaItems.map((media, index) => (
                        <button
                          key={`${media.type}-${media.url}-${index}`}
                          type="button"
                          onClick={() =>
                            setSelectedMedia(index)
                          }
                          className={`relative overflow-hidden rounded-xl border ${
                            selectedMedia === index
                              ? "border-white"
                              : "border-white/[0.06]"
                          }`}
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.url}
                              alt=""
                              className="h-16 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-full items-center justify-center bg-black text-white">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                                ▶
                              </div>

                              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[8px]">
                                ویدیو
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Product Info */}
              <div className="px-4 pb-4">
                <div className="rounded-xl bg-slate-800/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500">
                        قیمت اکانت
                      </p>

                      <p className="mt-1 text-sm font-black">
                        {formatPrice(selectedProduct.price)} تومان
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <HeartIcon
                        filled={Boolean(
                          liked[selectedProduct.id]
                        )}
                      />

                      <span className="text-xs font-bold">
                        {selectedProduct.likes.toLocaleString(
                          "fa-IR"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div className="mt-3 rounded-xl border border-white/[0.06] bg-slate-800/40 p-4">
                    <h3 className="text-xs font-black">
                      توضیحات اکانت
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-400">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="mt-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.05] p-3 text-center">
                  <p className="text-[11px] leading-5 text-emerald-300">
                    این اکانت قبلاً توسط شما خریداری شده است.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {message && (
          <div className="fixed bottom-5 left-1/2 z-[300] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-xl border border-white/[0.07] bg-slate-900/95 px-4 py-3 text-center text-xs font-medium text-white shadow-2xl backdrop-blur-md">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
