"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TransactionType = "deposit" | "withdraw";

type TransactionStatus =
  | "pending"
  | "approved"
  | "rejected";

type WalletTransaction = {
  id: number;
  userId: number;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  cardId: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;

  firstName: string | null;
  lastName: string | null;
  mobile: string | null;

  cardNumber: string | null;
  cardOwnerName: string | null;
};

type FilterType = "all" | "deposit" | "withdraw";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function getUserName(transaction: WalletTransaction) {
  const name = [
    transaction.firstName,
    transaction.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return name || "بدون نام";
}

export default function AdminTransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<
    WalletTransaction[]
  >([]);

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [loading, setLoading] = useState(true);

  async function loadTransactions() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "خطا در دریافت تراکنش‌ها."
        );
      }

      const list: WalletTransaction[] =
        Array.isArray(data?.transactions)
          ? data.transactions
          : [];

      setTransactions(list);
    } catch (error) {
      console.error(
        "loadTransactions error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "خطا در دریافت تراکنش‌ها."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter(
          (transaction) =>
            transaction.type === filter
        );

  const pendingCount = transactions.filter(
    (transaction) =>
      transaction.status === "pending"
  ).length;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-zinc-950 text-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black">
              تراکنش‌ها
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              مدیریت درخواست‌های واریز و برداشت کاربران
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/admin")
            }
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
          >
            بازگشت به پنل مدیریت
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">
              همه تراکنش‌ها
            </p>

            <p className="mt-2 text-3xl font-black">
              {transactions.length}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-sm text-zinc-400">
              در انتظار بررسی
            </p>

            <p className="mt-2 text-3xl font-black text-yellow-400">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-sm text-zinc-400">
              تأیید شده
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-400">
              {
                transactions.filter(
                  (transaction) =>
                    transaction.status ===
                    "approved"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              filter === "all"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            همه
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("deposit")
            }
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              filter === "deposit"
                ? "bg-emerald-500 text-black"
                : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            واریز
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("withdraw")
            }
            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
              filter === "withdraw"
                ? "bg-red-500 text-white"
                : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            برداشت
          </button>

          <button
            type="button"
            onClick={loadTransactions}
            disabled={loading}
            className="mr-auto rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10 disabled:opacity-50"
          >
            {loading
              ? "در حال دریافت..."
              : "بروزرسانی"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            در حال دریافت تراکنش‌ها...
          </div>
        )}

        {/* Empty */}
        {!loading &&
          filteredTransactions.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
              <p className="text-lg font-bold">
                تراکنشی پیدا نشد
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                در این بخش هنوز تراکنشی ثبت نشده است.
              </p>
            </div>
          )}

        {/* Transactions */}
        {!loading &&
          filteredTransactions.length > 0 && (
            <div className="space-y-4">
              {filteredTransactions.map(
                (transaction) => {
                  const fullName =
                    getUserName(transaction);

                  return (
                    <div
                      key={transaction.id}
                      className="rounded-3xl border border-white/10 bg-white/5 p-5"
                    >
                      {/* Top */}
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-black">
                              تراکنش #
                              {transaction.id}
                            </span>

                            {transaction.type ===
                              "deposit" ? (
                              <span className="rounded-xl bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                                واریز
                              </span>
                            ) : (
                              <span className="rounded-xl bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400">
                                برداشت
                              </span>
                            )}

                            {transaction.status ===
                              "pending" && (
                              <span className="rounded-xl bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-400">
                                در انتظار بررسی
                              </span>
                            )}

                            {transaction.status ===
                              "approved" && (
                              <span className="rounded-xl bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                                تأیید شده
                              </span>
                            )}

                            {transaction.status ===
                              "rejected" && (
                              <span className="rounded-xl bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400">
                                رد شده
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm text-zinc-500">
                            {formatDate(
                              transaction.createdAt
                            )}
                          </p>
                        </div>

                        <div className="text-right lg:text-left">
                          <p className="text-sm text-zinc-400">
                            مبلغ
                          </p>

                          <p
                            className={`mt-1 text-2xl font-black ${
                              transaction.type ===
                              "deposit"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatPrice(
                              transaction.amount
                            )}{" "}
                            تومان
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl bg-black/20 p-4">
                          <p className="text-xs text-zinc-500">
                            نام کاربر
                          </p>

                          <p className="mt-1 font-bold">
                            {fullName}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/20 p-4">
                          <p className="text-xs text-zinc-500">
                            شماره موبایل
                          </p>

                          <p className="mt-1 font-bold">
                            {transaction.mobile ||
                              "ثبت نشده"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/20 p-4">
                          <p className="text-xs text-zinc-500">
                            شناسه کاربر
                          </p>

                          <p className="mt-1 font-bold">
                            {transaction.userId}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/20 p-4">
                          <p className="text-xs text-zinc-500">
                            کارت بانکی
                          </p>

                          <p className="mt-1 font-bold">
                            {transaction.cardNumber ||
                              "ثبت نشده"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/20 p-4">
                          <p className="text-xs text-zinc-500">
                            صاحب کارت
                          </p>

                          <p className="mt-1 font-bold">
                            {transaction.cardOwnerName ||
                              "ثبت نشده"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/20 p-4">
                          <p className="text-xs text-zinc-500">
                            شناسه کارت
                          </p>

                          <p className="mt-1 font-bold">
                            {transaction.cardId ??
                              "ثبت نشده"}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {transaction.description && (
                        <div className="mt-3 rounded-2xl bg-black/20 p-4">
                          <p className="text-xs text-zinc-500">
                            توضیحات
                          </p>

                          <p className="mt-1 text-sm text-zinc-300">
                            {transaction.description}
                          </p>
                        </div>
                      )}

                      {/* Actions placeholder */}
                      {transaction.status ===
                        "pending" && (
                        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
                          <button
                            type="button"
                            disabled
                            className="flex-1 rounded-2xl bg-emerald-500/20 px-5 py-3 font-bold text-emerald-400 opacity-60"
                          >
                            تأیید تراکنش
                          </button>

                          <button
                            type="button"
                            disabled
                            className="flex-1 rounded-2xl bg-red-500/20 px-5 py-3 font-bold text-red-400 opacity-60"
                          >
                            رد تراکنش
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
      </div>
    </main>
  );
}