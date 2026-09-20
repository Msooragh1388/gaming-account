
"use client";

import { useEffect, useState } from "react";

type Card = {
  id: number;
  cardNumber: string;
  ownerName: string;
  bankName?: string | null;
  createdAt?: string;
};

type Wallet = {
  balance: number;
};

type ActionType = "deposit" | "withdraw" | null;

const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 10000000;

const DEPOSIT_CARD_NUMBER = "6219861858148041";
const DEPOSIT_CARD_OWNER = "محمد سراقی";

function WalletIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7V5.5A2.5 2.5 0 0 0 17.5 3h-13A2.5 2.5 0 0 0 2 5.5v13A2.5 2.5 0 0 0 4.5 21H19a3 3 0 0 0 3-3V9a2 2 0 0 0-2-2Z" />
      <path d="M2 7h18" />
      <path d="M16 13h6" />
      <path d="M17 13v2" />
    </svg>
  );
}

function ArrowIcon({
  direction = "left",
}: {
  direction?: "left" | "right";
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </>
      )}
    </svg>
  );
}

function VerticalArrowIcon({
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
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "up" ? (
        <>
          <path d="M12 19V5" />
          <path d="m6 11 6-6 6 6" />
        </>
      ) : (
        <>
          <path d="M12 5v14" />
          <path d="m18 13-6 6-6-6" />
        </>
      )}
    </svg>
  );
}

function CardIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  );
}

function CheckIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function formatToman(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatCardNumber(cardNumber: string) {
  const clean = cardNumber.replace(/\D/g, "").slice(0, 16);

  if (clean.length !== 16) {
    return cardNumber;
  }

  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(
    8,
    12
  )} ${clean.slice(12, 16)}`;
}

function normalizeNumber(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    )
    .replace(/\D/g, "");
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  const [action, setAction] = useState<ActionType>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const [amount, setAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositConfirmed, setDepositConfirmed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("gaming_account_token");

      if (!token) {
        setError("ابتدا وارد حساب کاربری شوید.");
        return;
      }

      const walletResponse = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          action: "get",
        }),
        cache: "no-store",
      });

      const walletData = await walletResponse.json();

      if (!walletResponse.ok) {
        throw new Error(
          walletData?.error || "خطا در دریافت اطلاعات کیف پول"
        );
      }

      setWallet({
        balance: Number(walletData?.wallet?.balance ?? 0),
      });

      const profileResponse = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          action: "get",
        }),
        cache: "no-store",
      });

      const profileData = await profileResponse.json();

      if (profileResponse.ok && Array.isArray(profileData?.cards)) {
        setCards(profileData.cards);
      } else {
        setCards([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در دریافت اطلاعات"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleBack() {
    window.history.back();
  }

  function selectAction(nextAction: ActionType) {
    setAction(nextAction);
    setAmount("");
    setSelectedCardId(null);
    setMessage("");
    setError("");
    setDepositConfirmed(false);
    setDepositAmount("");
  }

  function cancelAction() {
    setAction(null);
    setAmount("");
    setSelectedCardId(null);
    setMessage("");
    setError("");
    setDepositConfirmed(false);
    setDepositAmount("");
  }

  function handleAmountChange(value: string) {
    const normalized = normalizeNumber(value);

    if (normalized.length > 10) {
      return;
    }

    setAmount(normalized);
    setError("");
  }

  async function submitRequest() {
    setError("");
    setMessage("");

    const token = localStorage.getItem("gaming_account_token");

    if (!token) {
      setError("نشست کاربر معتبر نیست.");
      return;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < MIN_AMOUNT) {
      setError(`حداقل مبلغ ${formatToman(MIN_AMOUNT)} تومان است.`);
      return;
    }

    if (numericAmount > MAX_AMOUNT) {
      setError(`حداکثر مبلغ ${formatToman(MAX_AMOUNT)} تومان است.`);
      return;
    }

    if (!selectedCardId) {
      setError("لطفاً کارت بانکی خود را انتخاب کنید.");
      return;
    }

    if (action === "withdraw") {
      const currentBalance = Number(wallet?.balance ?? 0);

      if (numericAmount > currentBalance) {
        setError("موجودی کیف پول برای این برداشت کافی نیست.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          action,
          amount: numericAmount,
          cardId: selectedCardId,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(data?.error || "خطا در ثبت درخواست");
      }

      if (action === "deposit") {
        setDepositAmount(String(numericAmount));
        setDepositConfirmed(true);
        setAmount("");
        setSelectedCardId(null);
        setMessage("");
        setError("");
      } else {
        setMessage(
          data?.message || "درخواست برداشت شما با موفقیت ثبت شد."
        );

        setAmount("");
        setSelectedCardId(null);

        await loadData();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در ثبت درخواست"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startNewDeposit() {
    setDepositConfirmed(false);
    setDepositAmount("");
    setAmount("");
    setSelectedCardId(null);
    setError("");
    setMessage("");
  }

  async function copyCardNumber() {
    try {
      await navigator.clipboard.writeText(DEPOSIT_CARD_NUMBER);
      setMessage("شماره کارت با موفقیت کپی شد.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch {
      setError("کپی شماره کارت انجام نشد.");
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#070b14] px-4 py-10 text-white"
      >
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-white" />

            <p className="text-sm text-slate-400">
              در حال دریافت اطلاعات کیف پول...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#070b14] px-4 py-6 text-white sm:px-6 sm:py-10"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[-180px] top-[-180px] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute bottom-[-180px] left-[-180px] h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="group flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-slate-300 shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.09] hover:text-white active:scale-95"
          >
            <ArrowIcon direction="right" />
            بازگشت
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/5">
              <WalletIcon size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-white">
                کیف پول
              </h1>

              <p className="text-xs text-slate-500">
                مدیریت موجودی حساب
              </p>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-5 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              موجودی کیف پول
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300">
              <WalletIcon size={19} />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {formatToman(Number(wallet?.balance ?? 0))}
            </span>

            <span className="mb-1 text-sm text-slate-500">
              تومان
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.08] p-4 text-sm text-red-300">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-xs">
              !
            </span>

            <span>{error}</span>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4 text-sm text-emerald-300">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckIcon size={13} />
            </span>

            <span>{message}</span>
          </div>
        )}

        {/* Action Selection */}
        {!action && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-bold text-white">
                  عملیات کیف پول
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  عملیات موردنظر خود را انتخاب کنید
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Deposit */}
              <button
                type="button"
                onClick={() => selectAction("deposit")}
                className="group flex h-[78px] items-center justify-between rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] px-3.5 text-right transition-all duration-200 hover:border-emerald-400/30 hover:bg-emerald-500/[0.1] hover:shadow-lg hover:shadow-emerald-950/20 active:scale-[0.98]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-transform duration-200 group-hover:scale-105">
                    <VerticalArrowIcon direction="down" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      واریز وجه
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      افزایش موجودی
                    </p>
                  </div>
                </div>
              </button>

              {/* Withdraw */}
              <button
                type="button"
                onClick={() => selectAction("withdraw")}
                className="group flex h-[78px] items-center justify-between rounded-2xl border border-orange-400/15 bg-orange-500/[0.06] px-3.5 text-right transition-all duration-200 hover:border-orange-400/30 hover:bg-orange-500/[0.1] hover:shadow-lg hover:shadow-orange-950/20 active:scale-[0.98]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-transform duration-200 group-hover:scale-105">
                    <VerticalArrowIcon direction="up" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      برداشت وجه
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      کاهش موجودی
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Deposit */}
        {action === "deposit" && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            {!depositConfirmed ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      واریز وجه
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      اطلاعات واریز را وارد کنید
                    </p>
                  </div>

                  <button
                    onClick={cancelAction}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl text-slate-400 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
                  >
                    ×
                  </button>
                </div>

                {cards.length === 0 ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                      <CardIcon size={24} />
                    </div>

                    <h3 className="font-bold text-white">
                      کارت بانکی ثبت نشده
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      برای انجام واریز، ابتدا یک کارت بانکی به حساب خود اضافه کنید.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="mb-3 flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-200">
                          کارت مبدأ
                        </label>

                        <span className="text-[11px] text-slate-500">
                          کارت خودتان را انتخاب کنید
                        </span>
                      </div>

                      <div className="space-y-3">
                        {cards.map((card) => {
                          const selected =
                            selectedCardId === card.id;

                          return (
                            <button
                              key={card.id}
                              onClick={() => {
                                setSelectedCardId(card.id);
                                setError("");
                              }}
                              className={`group flex w-full items-center gap-2.5 rounded-2xl border p-3 text-right transition-all duration-200 active:scale-[0.99] sm:gap-4 sm:p-4 ${
                                selected
                                  ? "border-blue-400/40 bg-blue-500/[0.09] shadow-lg shadow-blue-950/20"
                                  : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                              }`}
                            >
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition sm:h-12 sm:w-12 ${
                                  selected
                                    ? "bg-blue-500/15 text-blue-400"
                                    : "bg-white/[0.06] text-slate-400 group-hover:text-slate-200"
                                }`}
                              >
                                <CardIcon size={22} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-1 text-[11px] text-slate-500">
                                  {card.ownerName || "کارت بانکی"}
                                </div>

                                <div className="overflow-hidden font-mono text-[11px] font-semibold tracking-normal text-white sm:text-sm">
                                  <span className="block whitespace-nowrap">
                                    {formatCardNumber(card.cardNumber)}
                                  </span>
                                </div>
                              </div>

                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                                  selected
                                    ? "border-blue-400 bg-blue-500 text-white"
                                    : "border-white/15 bg-transparent text-transparent"
                                }`}
                              >
                                <CheckIcon size={13} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="mb-3 block text-sm font-semibold text-slate-200">
                        مبلغ واریز
                      </label>

                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          dir="ltr"
                          value={amount}
                          onChange={(e) =>
                            handleAmountChange(e.target.value)
                          }
                          placeholder="مثلاً 500000"
                          className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b101c] px-4 pl-16 text-left text-base font-semibold tracking-wide text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/40 focus:bg-[#0d1321] focus:ring-4 focus:ring-blue-500/[0.06]"
                        />

                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                          تومان
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                        <span>
                          حداقل: {formatToman(MIN_AMOUNT)}
                        </span>

                        <span>
                          حداکثر: {formatToman(MAX_AMOUNT)}
                        </span>
                      </div>

                      {amount && (
                        <div className="mt-2 text-xs text-slate-500">
                          مبلغ:
                          <span className="mr-1 font-semibold text-slate-300">
                            {formatToman(Number(amount))} تومان
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-6 rounded-2xl border border-blue-400/10 bg-blue-500/[0.045] p-4">
                      <div className="flex gap-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                          i
                        </div>

                        <p className="text-xs leading-6 text-slate-400">
                          پس از تأیید، شماره کارت مقصد و مبلغ دقیق واریز به شما نمایش داده می‌شود.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={submitRequest}
                      disabled={submitting}
                      className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-bold text-white shadow-xl shadow-blue-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-400 hover:shadow-2xl hover:shadow-blue-900/40 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {submitting ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          در حال ثبت...
                        </>
                      ) : (
                        <>
                          تأیید و ادامه
                          <ArrowIcon direction="left" />
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            ) : (
              <div>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-950/20">
                    <CheckIcon size={31} />
                  </div>

                  <h2 className="text-xl font-black text-white">
                    اطلاعات واریز آماده است
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    مبلغ زیر را دقیقاً به کارت مقصد واریز کنید.
                  </p>
                </div>

                <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <div className="mb-2 text-xs text-slate-500">
                    مبلغ واریز
                  </div>

                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-white">
                      {formatToman(Number(depositAmount))}
                    </span>

                    <span className="mb-1 text-xs text-slate-500">
                      تومان
                    </span>
                  </div>
                </div>

                <div className="mb-4 overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.09] to-white/[0.025]">
                  <div className="border-b border-white/10 px-5 py-4">
                    <div className="text-xs text-slate-500">
                      کارت مقصد
                    </div>

                    <div className="mt-1 text-sm font-semibold text-white">
                      {DEPOSIT_CARD_OWNER}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 overflow-hidden text-center font-mono text-[14px] font-black tracking-normal text-white sm:text-xl">
                      <span className="whitespace-nowrap">
                        {formatCardNumber(DEPOSIT_CARD_NUMBER)}
                      </span>
                    </div>

                    <button
                      onClick={copyCardNumber}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] text-xs font-semibold text-slate-300 transition hover:bg-white/[0.1] hover:text-white active:scale-[0.98]"
                    >
                      <CopyIcon size={17} />
                      کپی شماره کارت
                    </button>
                  </div>
                </div>

                <div className="mb-6 rounded-2xl border border-amber-400/15 bg-amber-500/[0.055] p-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                      !
                    </div>

                    <div>
                      <div className="mb-1 text-xs font-bold text-amber-300">
                        توجه
                      </div>

                      <p className="text-xs leading-6 text-slate-400">
                        لطفاً واریز را حداکثر تا ۱۵ دقیقه انجام دهید و مبلغ را دقیقاً مطابق مبلغ نمایش‌داده‌شده واریز کنید.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startNewDeposit}
                  className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 text-sm font-bold text-slate-200 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.09] hover:text-white active:scale-[0.99]"
                >
                  انجام واریز جدید
                </button>
              </div>
            )}
          </div>
        )}

        {/* Withdraw */}
        {action === "withdraw" && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  برداشت وجه
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  مبلغ و کارت مقصد برداشت را مشخص کنید
                </p>
              </div>

              <button
                onClick={cancelAction}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl text-slate-400 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-200">
                  کارت مقصد
                </label>

                <span className="text-[11px] text-slate-500">
                  کارت بانکی خود را انتخاب کنید
                </span>
              </div>

              {cards.length === 0 ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-5 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                    <CardIcon size={24} />
                  </div>

                  <p className="text-sm font-semibold text-white">
                    کارت بانکی ثبت نشده است
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    برای برداشت ابتدا یک کارت بانکی اضافه کنید.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cards.map((card) => {
                    const selected =
                      selectedCardId === card.id;

                    return (
                      <button
                        key={card.id}
                        onClick={() => {
                          setSelectedCardId(card.id);
                          setError("");
                        }}
                        className={`group flex w-full items-center gap-2.5 rounded-2xl border p-3 text-right transition-all duration-200 active:scale-[0.99] sm:gap-4 sm:p-4 ${
                          selected
                            ? "border-orange-400/40 bg-orange-500/[0.08] shadow-lg shadow-orange-950/20"
                            : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${
                            selected
                              ? "bg-orange-500/15 text-orange-400"
                              : "bg-white/[0.06] text-slate-400 group-hover:text-slate-200"
                          }`}
                        >
                          <CardIcon size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-[11px] text-slate-500">
                            {card.ownerName || "کارت بانکی"}
                          </div>

                          <div className="overflow-hidden font-mono text-[11px] font-semibold tracking-normal text-white sm:text-sm">
                            <span className="block whitespace-nowrap">
                              {formatCardNumber(card.cardNumber)}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-orange-400 bg-orange-500 text-white"
                              : "border-white/15 text-transparent"
                          }`}
                        >
                          <CheckIcon size={13} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-sm font-semibold text-slate-200">
                مبلغ برداشت
              </label>

              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={amount}
                  onChange={(e) =>
                    handleAmountChange(e.target.value)
                  }
                  placeholder="مثلاً 500000"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b101c] px-4 pl-16 text-left text-base font-semibold tracking-wide text-white outline-none transition placeholder:text-slate-700 focus:border-orange-400/40 focus:bg-[#0d1321] focus:ring-4 focus:ring-orange-500/[0.06]"
                />

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                  تومان
                </span>
              </div>

              {amount && (
                <div className="mt-2 text-xs text-slate-500">
                  مبلغ:
                  <span className="mr-1 font-semibold text-slate-300">
                    {formatToman(Number(amount))} تومان
                  </span>
                </div>
              )}

              <div className="mt-2 text-[11px] text-slate-600">
                موجودی فعلی:{" "}
                <span className="text-slate-400">
                  {formatToman(Number(wallet?.balance ?? 0))} تومان
                </span>
              </div>
            </div>

            <button
              onClick={submitRequest}
              disabled={submitting || cards.length === 0}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-sm font-bold text-white shadow-xl shadow-orange-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-orange-500 hover:to-orange-400 hover:shadow-2xl hover:shadow-orange-900/40 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  ثبت درخواست برداشت
                  <ArrowIcon direction="left" />
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-5 text-center text-[11px] text-slate-700">
          امنیت اطلاعات و تراکنش‌های شما برای ما اهمیت دارد.
        </div>
      </div>
    </main>
  );
}

