"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Transaction = {
  id: number;
  type: "deposit" | "withdraw";
  amount: number;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";
  cardId: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type FilterType = "all" | "deposit" | "withdraw";

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function getStatusText(status: Transaction["status"]) {
  if (status === "pending") {
    return "در انتظار";
  }

  if (status === "approved") {
    return "تأیید شده";
  }

  if (status === "cancelled") {
    return "لغو شده";
  }

  return "رد شده";
}

function getTypeText(type: Transaction["type"]) {
  return type === "deposit" ? "واریز" : "برداشت";
}

function ArrowIcon({
  direction,
}: {
  direction: "up" | "down";
}) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "down" ? (
        <>
          <path d="M12 5v14" />
          <path d="m7 14 5 5 5-5" />
        </>
      ) : (
        <>
          <path d="M12 19V5" />
          <path d="m7 10 5-5 5 5" />
        </>
      )}
    </svg>
  );
}

function StatusDot({
  status,
}: {
  status: Transaction["status"];
}) {
  return (
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        display: "inline-block",
        flexShrink: 0,
        background:
          status === "pending"
            ? "#f59e0b"
            : status === "approved"
            ? "#22c55e"
            : status === "cancelled"
            ? "#94a3b8"
            : "#ef4444",
      }}
    />
  );
}

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>(
    []
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(
    null
  );

  async function loadTransactions() {
    try {
      const token =
        localStorage.getItem("gaming_account_token");

      if (!token) {
        router.replace("/profile");
        return;
      }

      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "دریافت تراکنش‌ها با مشکل مواجه شد."
        );
      }

      if (!result?.success) {
        throw new Error(
          result?.error ||
            "دریافت تراکنش‌ها با مشکل مواجه شد."
        );
      }

      setTransactions(
        Array.isArray(result.transactions)
          ? result.transactions
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "خطایی در دریافت تراکنش‌ها رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [router]);

  async function handleCancelTransaction(
    transactionId: number
  ) {
    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید این تراکنش را لغو کنید؟"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem("gaming_account_token");

      if (!token) {
        router.replace("/profile");
        return;
      }

      setCancellingId(transactionId);
      setError("");

      const response = await fetch(
        "/api/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            action: "cancel",
            transactionId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "لغو تراکنش با مشکل مواجه شد."
        );
      }

      if (!result?.success) {
        throw new Error(
          result?.error ||
            "لغو تراکنش انجام نشد."
        );
      }

      // بعد از لغو، لیست تراکنش‌ها دوباره از دیتابیس دریافت می‌شود
      await loadTransactions();
    } catch (err) {
      console.error(
        "handleCancelTransaction error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "لغو تراکنش با مشکل مواجه شد."
      );
    } finally {
      setCancellingId(null);
    }
  }

  const filteredTransactions = useMemo(() => {
    if (filter === "all") {
      return transactions;
    }

    return transactions.filter(
      (transaction) =>
        transaction.type === filter
    );
  }, [transactions, filter]);

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0b1120 0%, #111827 100%)",
        color: "#fff",
        padding: "18px 14px 110px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/profile")}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border:
                "1px solid rgba(255,255,255,0.055)",
              background:
                "rgba(255,255,255,0.035)",
              color: "#cbd5e1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              transition: "0.2s",
            }}
          >
            ←
          </button>

          <div
            style={{
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 19,
                fontWeight: 750,
                letterSpacing: "-0.3px",
              }}
            >
              تراکنش‌ها
            </h1>

            <div
              style={{
                marginTop: 3,
                fontSize: 10,
                color: "#64748b",
              }}
            >
              تاریخچه کیف پول
            </div>
          </div>

          <div style={{ width: 34 }} />
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 14,
            padding: 4,
            borderRadius: 12,
            background:
              "rgba(255,255,255,0.025)",
            border:
              "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {(
            [
              ["all", "همه"],
              ["deposit", "واریز"],
              ["withdraw", "برداشت"],
            ] as [FilterType, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              style={{
                flex: 1,
                height: 34,
                border: "none",
                borderRadius: 9,
                background:
                  filter === value
                    ? "rgba(255,255,255,0.075)"
                    : "transparent",
                color:
                  filter === value
                    ? "#f8fafc"
                    : "#64748b",
                cursor: "pointer",
                fontSize: 12,
                fontWeight:
                  filter === value ? 700 : 500,
                transition: "0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              padding: 26,
              textAlign: "center",
              color: "#64748b",
              fontSize: 12,
              borderRadius: 14,
              border:
                "1px solid rgba(255,255,255,0.05)",
              background:
                "rgba(255,255,255,0.025)",
            }}
          >
            در حال دریافت تراکنش‌ها...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              padding: 18,
              textAlign: "center",
              color: "#fca5a5",
              fontSize: 12,
              borderRadius: 14,
              border:
                "1px solid rgba(239,68,68,0.14)",
              background:
                "rgba(239,68,68,0.055)",
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredTransactions.length === 0 && (
            <div
              style={{
                padding: "42px 20px",
                textAlign: "center",
                borderRadius: 14,
                border:
                  "1px solid rgba(255,255,255,0.05)",
                background:
                  "rgba(255,255,255,0.025)",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  margin: "0 auto 12px",
                  borderRadius: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(255,255,255,0.035)",
                  color: "#64748b",
                  fontSize: 19,
                }}
              >
                ↔
              </div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  marginBottom: 5,
                }}
              >
                تراکنشی وجود ندارد
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                تراکنش‌های کیف پول شما اینجا نمایش داده می‌شوند.
              </div>
            </div>
          )}

        {/* Transactions */}
        {!loading &&
          !error &&
          filteredTransactions.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              {filteredTransactions.map(
                (transaction) => {
                  const isDeposit =
                    transaction.type === "deposit";

                  const statusColor =
                    transaction.status === "pending"
                      ? "#fbbf24"
                      : transaction.status ===
                        "approved"
                      ? "#4ade80"
                      : transaction.status ===
                        "cancelled"
                      ? "#94a3b8"
                      : "#f87171";

                  return (
                    <div
                      key={transaction.id}
                      style={{
                        borderRadius: 14,
                        border:
                          "1px solid rgba(255,255,255,0.055)",
                        background:
                          "rgba(255,255,255,0.028)",
                        padding: "12px 13px",
                      }}
                    >
                      {/* Top */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              flexShrink: 0,
                              background:
                                "rgba(255,255,255,0.04)",
                              border:
                                "1px solid rgba(255,255,255,0.035)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#94a3b8",
                            }}
                          >
                            <ArrowIcon
                              direction={
                                isDeposit
                                  ? "down"
                                  : "up"
                              }
                            />
                          </div>

                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#e2e8f0",
                                }}
                              >
                                {getTypeText(
                                  transaction.type
                                )}
                              </span>

                              <span
                                style={{
                                  fontSize: 9,
                                  color: "#475569",
                                }}
                              >
                                #{transaction.id}
                              </span>
                            </div>

                            <div
                              style={{
                                marginTop: 3,
                                fontSize: 10,
                                color: "#64748b",
                              }}
                            >
                              {formatDate(
                                transaction.createdAt
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            flexShrink: 0,
                            color: statusColor,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          <StatusDot
                            status={
                              transaction.status
                            }
                          />

                          {getStatusText(
                            transaction.status
                          )}
                        </div>
                      </div>

                      {/* Bottom */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          marginTop: 10,
                          paddingTop: 9,
                          borderTop:
                            "1px solid rgba(255,255,255,0.045)",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              color: "#475569",
                              marginBottom: 3,
                            }}
                          >
                            مبلغ
                          </div>

                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 750,
                              color: isDeposit
                                ? "#e2e8f0"
                                : "#cbd5e1",
                            }}
                          >
                            {isDeposit ? "+" : "-"}{" "}
                            {formatAmount(
                              transaction.amount
                            )}{" "}
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 500,
                                color: "#64748b",
                              }}
                            >
                              تومان
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {transaction.status ===
                            "pending" && (
                            <button
                              type="button"
                              disabled={
                                cancellingId ===
                                transaction.id
                              }
                              onClick={() =>
                                handleCancelTransaction(
                                  transaction.id
                                )
                              }
                              style={{
                                border:
                                  "1px solid rgba(239,68,68,0.18)",
                                background:
                                  cancellingId ===
                                  transaction.id
                                    ? "rgba(239,68,68,0.03)"
                                    : "rgba(239,68,68,0.07)",
                                color:
                                  cancellingId ===
                                  transaction.id
                                    ? "#64748b"
                                    : "#f87171",
                                borderRadius: 9,
                                padding: "7px 10px",
                                fontSize: 10,
                                fontWeight: 600,
                                cursor:
                                  cancellingId ===
                                  transaction.id
                                    ? "default"
                                    : "pointer",
                              }}
                            >
                              {cancellingId ===
                              transaction.id
                                ? "در حال لغو..."
                                : "لغو تراکنش"}
                            </button>
                          )}

                          <div
                            style={{
                              textAlign: "left",
                              fontSize: 10,
                              color: "#475569",
                            }}
                          >
                            کیف پول
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {transaction.description && (
                        <div
                          style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop:
                              "1px solid rgba(255,255,255,0.035)",
                            fontSize: 10,
                            lineHeight: 1.8,
                            color: "#64748b",
                          }}
                        >
                          {transaction.description}
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