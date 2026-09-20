"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Transaction = {
  id: number;
  type: "deposit" | "withdraw";
  amount: number;
  status: "pending" | "approved" | "rejected";
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
    return "در انتظار تأیید";
  }

  if (status === "approved") {
    return "تأیید شده";
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
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "down" ? (
        <>
          <path d="M12 4v15" />
          <path d="m6 13 6 6 6-6" />
        </>
      ) : (
        <>
          <path d="M12 20V5" />
          <path d="m6 11 6-6 6 6" />
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
  if (status === "pending") {
    return (
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#f59e0b",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
    );
  }

  if (status === "approved") {
    return (
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#22c55e",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#ef4444",
        display: "inline-block",
        flexShrink: 0,
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

  useEffect(() => {
    const token =
      localStorage.getItem("gaming_account_token");

    if (!token) {
      router.replace("/profile");
      return;
    }

    async function loadTransactions() {
      try {
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

    loadTransactions();
  }, [router]);

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
          "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
        color: "#fff",
        padding: "24px 16px 40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <button
            onClick={() => router.push("/profile")}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            ←
          </button>

          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            تراکنش‌ها
          </h1>

          <div style={{ width: 38 }} />
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 18,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: 6,
            borderRadius: 14,
          }}
        >
          <button
            onClick={() => setFilter("all")}
            style={{
              flex: 1,
              height: 38,
              border: "none",
              borderRadius: 10,
              background:
                filter === "all"
                  ? "#334155"
                  : "transparent",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            همه
          </button>

          <button
            onClick={() => setFilter("deposit")}
            style={{
              flex: 1,
              height: 38,
              border: "none",
              borderRadius: 10,
              background:
                filter === "deposit"
                  ? "#334155"
                  : "transparent",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            واریز
          </button>

          <button
            onClick={() => setFilter("withdraw")}
            style={{
              flex: 1,
              height: 38,
              border: "none",
              borderRadius: 10,
              background:
                filter === "withdraw"
                  ? "#334155"
                  : "transparent",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            برداشت
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              background:
                "rgba(255,255,255,0.04)",
              border:
                "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: 28,
              textAlign: "center",
              color: "#cbd5e1",
              fontSize: 14,
            }}
          >
            در حال دریافت تراکنش‌ها...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background:
                "rgba(239,68,68,0.08)",
              border:
                "1px solid rgba(239,68,68,0.2)",
              borderRadius: 16,
              padding: 20,
              textAlign: "center",
              color: "#fca5a5",
              fontSize: 14,
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
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: 40,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 38,
                  marginBottom: 12,
                }}
              >
                ↔
              </div>

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                تراکنشی وجود ندارد
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
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
                gap: 10,
              }}
            >
              {filteredTransactions.map(
                (transaction) => {
                  const isDeposit =
                    transaction.type ===
                    "deposit";

                  return (
                    <div
                      key={transaction.id}
                      style={{
                        background:
                          "rgba(255,255,255,0.04)",
                        border:
                          "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 16,
                        padding: 16,
                      }}
                    >
                      {/* Top */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          gap: 12,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              background:
                                "rgba(255,255,255,0.06)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                "center",
                              color: "#e2e8f0",
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

                          <div>
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: 800,
                                marginBottom: 4,
                              }}
                            >
                              {getTypeText(
                                transaction.type
                              )}
                            </div>

                            <div
                              style={{
                                fontSize: 12,
                                color: "#94a3b8",
                              }}
                            >
                              تراکنش #
                              {transaction.id}
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding:
                              "6px 9px",
                            borderRadius: 9,
                            background:
                              "rgba(255,255,255,0.05)",
                            color:
                              transaction.status ===
                              "pending"
                                ? "#fbbf24"
                                : transaction.status ===
                                  "approved"
                                ? "#4ade80"
                                : "#f87171",
                            fontSize: 11,
                            fontWeight: 700,
                            whiteSpace:
                              "nowrap",
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

                      {/* Amount */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          paddingTop: 12,
                          borderTop:
                            "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#64748b",
                              marginBottom: 5,
                            }}
                          >
                            مبلغ
                          </div>

                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 800,
                            }}
                          >
                            {isDeposit
                              ? "+"
                              : "-"}
                            {" "}
                            {formatAmount(
                              transaction.amount
                            )}{" "}
                            تومان
                          </div>
                        </div>

                        <div
                          style={{
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: "#64748b",
                              marginBottom: 5,
                            }}
                          >
                            تاریخ
                          </div>

                          <div
                            style={{
                              fontSize: 12,
                              color: "#cbd5e1",
                            }}
                          >
                            {formatDate(
                              transaction.createdAt
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {transaction.description && (
                        <div
                          style={{
                            marginTop: 12,
                            fontSize: 12,
                            color: "#94a3b8",
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