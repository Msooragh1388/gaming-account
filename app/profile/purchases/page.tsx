"use client";

import { useEffect, useState } from "react";

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

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 4H5L7.2 15.2C7.39 16.17 8.24 16.87 9.23 16.87H17.5C18.4 16.87 19.19 16.27 19.31 15.38L20.5 8H6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9.5"
        cy="20"
        r="1.3"
        fill="currentColor"
      />
      <circle
        cx="17.5"
        cy="20"
        r="1.3"
        fill="currentColor"
      />
    </svg>
  );
}

function EyeIcon({
  visible,
}: {
  visible: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      {visible ? (
        <>
          <path
            d="M2.5 12C4.2 8.4 7.6 6 12 6C16.4 6 19.8 8.4 21.5 12C19.8 15.6 16.4 18 12 18C7.6 18 4.2 15.6 2.5 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx="12"
            cy="12"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </>
      ) : (
        <>
          <path
            d="M3 3L21 21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <path
            d="M10.6 6.2C11.05 6.07 11.52 6 12 6C16.4 6 19.8 8.4 21.5 12C20.85 13.37 19.93 14.58 18.82 15.55"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M6.12 7.15C4.56 8.22 3.31 9.88 2.5 12C4.2 15.6 7.6 18 12 18C13.43 18 14.75 17.72 15.93 17.21"
            stroke="currentColor"
            strokeWidth="1.8"
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
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M16 8V6.5C16 5.67 15.33 5 14.5 5H6.5C5.67 5 5 5.67 5 6.5V14.5C5 15.33 5.67 16 6.5 16H8"
        stroke="currentColor"
        strokeWidth="1.8"
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

export default function PurchasesPage() {
  const [purchases, setPurchases] =
    useState<Purchase[]>([]);

  const [visiblePasswords, setVisiblePasswords] =
    useState<Record<number, boolean>>({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadPurchases();
  }, []);

  async function loadPurchases() {
    setLoading(true);
    setError("");

    const token = localStorage.getItem(
      "gaming_account_token"
    );

    if (!token) {
      window.location.href =
        "/profile";
      return;
    }

    try {
      const response = await fetch(
        "/api/purchases",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "دریافت خریدها ناموفق بود."
        );
      }

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.purchases)
          ? data.purchases
          : [];

      setPurchases(
        list as Purchase[]
      );
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

  function togglePassword(
    purchaseId: number
  ) {
    setVisiblePasswords(
      (current) => ({
        ...current,
        [purchaseId]:
          !current[purchaseId],
      })
    );
  }

  async function copyText(
    text: string,
    successMessage: string
  ) {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setMessage(
        successMessage
      );
    } catch {
      setError(
        "کپی کردن انجام نشد."
      );
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat(
      "fa-IR"
    ).format(price);
  }

  function formatDate(
    dateString: string
  ) {
    try {
      return new Intl.DateTimeFormat(
        "fa-IR",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ).format(
        new Date(dateString)
      );
    } catch {
      return dateString;
    }
  }

  function goBack() {
    window.location.href =
      "/profile";
  }

  function openProduct(
    productId: number
  ) {
    window.location.href =
      `/product/${productId}`;
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
                در حال دریافت خریدهای شما...
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
                <CartIcon />
              </div>
            </div>

            <h1 className="mt-3 text-xl font-black">
              اکانت‌های خریداری‌شده
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              مشاهده خریدها و اطلاعات اکانت‌ها
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
        {purchases.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
              <CartIcon />
            </div>

            <h2 className="mt-5 text-lg font-black">
              هنوز خریدی انجام نداده‌ای
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              بعد از خرید یک اکانت،
              اطلاعات آن از اینجا قابل مشاهده خواهد بود.
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
                {purchases.length.toLocaleString(
                  "fa-IR"
                )}{" "}
                خرید
              </p>
            </div>

            {/* Purchases */}
            <div className="space-y-5">
              {purchases.map(
                (purchase) => {
                  const passwordVisible =
                    Boolean(
                      visiblePasswords[
                        purchase.id
                      ]
                    );

                  return (
                    <article
                      key={
                        purchase.id
                      }
                      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl"
                    >
                      {/* Purchase header */}
                      <div className="border-b border-white/10 p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                            <CartIcon />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h2 className="font-black leading-6">
                              {
                                purchase.productTitle
                              }
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                purchase.game
                              }
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-slate-800 p-3">
                            <p className="text-[11px] text-slate-500">
                              مبلغ خرید
                            </p>

                            <p className="mt-1 text-sm font-black">
                              {formatPrice(
                                purchase.price
                              )}{" "}
                              تومان
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-800 p-3">
                            <p className="text-[11px] text-slate-500">
                              تاریخ خرید
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-300">
                              {formatDate(
                                purchase.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Account information */}
                      <div className="p-5">
                        <div className="mb-4">
                          <h3 className="font-black">
                            اطلاعات اکانت
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            اطلاعات ورود خریداری‌شده
                          </p>
                        </div>

                        {/* Username */}
                        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-slate-500">
                                نام کاربری
                              </p>

                              <p
                                dir="ltr"
                                className="mt-2 truncate text-sm font-bold text-white"
                              >
                                {
                                  purchase.accountUsername
                                }
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
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-slate-300 transition hover:bg-slate-600 hover:text-white"
                              aria-label="کپی نام کاربری"
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        </div>

                        {/* Password */}
                        <div className="mt-3 rounded-2xl border border-slate-700 bg-slate-800 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-slate-500">
                                رمز عبور
                              </p>

                              <p
                                dir="ltr"
                                className="mt-2 truncate text-sm font-bold tracking-wider text-white"
                              >
                                {passwordVisible
                                  ? purchase.accountPassword
                                  : "••••••••••••"}
                              </p>
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  togglePassword(
                                    purchase.id
                                  )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-slate-300 transition hover:bg-slate-600 hover:text-white"
                                aria-label={
                                  passwordVisible
                                    ? "مخفی کردن رمز"
                                    : "نمایش رمز"
                                }
                              >
                                <EyeIcon
                                  visible={
                                    passwordVisible
                                  }
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
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-slate-300 transition hover:bg-slate-600 hover:text-white"
                                aria-label="کپی رمز عبور"
                              >
                                <CopyIcon />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Backup password 1 */}
                        {purchase
                          .backupPassword1 && (
                          <div className="mt-3 rounded-2xl border border-slate-700 bg-slate-800 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs text-slate-500">
                                  رمز پشتیبان ۱
                                </p>

                                <p
                                  dir="ltr"
                                  className="mt-2 truncate text-sm font-bold tracking-wider"
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
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-slate-300 transition hover:bg-slate-600 hover:text-white"
                                aria-label="کپی رمز پشتیبان"
                              >
                                <CopyIcon />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Backup password 2 */}
                        {purchase
                          .backupPassword2 && (
                          <div className="mt-3 rounded-2xl border border-slate-700 bg-slate-800 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs text-slate-500">
                                  رمز پشتیبان ۲
                                </p>

                                <p
                                  dir="ltr"
                                  className="mt-2 truncate text-sm font-bold tracking-wider"
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
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-slate-300 transition hover:bg-slate-600 hover:text-white"
                                aria-label="کپی رمز پشتیبان"
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
                            openProduct(
                              purchase.productId
                            )
                          }
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                        >
                          مشاهده صفحه اکانت
                          <ArrowIcon />
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
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