"use client";

import { useEffect, useState } from "react";

type Card = {
  id: number;
  cardNumber: string;
  ownerName: string;
};

type Wallet = {
  balance: number;
};

type ActionType = "none" | "deposit" | "withdraw";

const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 10000000;

const DEPOSIT_CARD_NUMBER = "6219861858148041";
const DEPOSIT_CARD_OWNER = "محمد سراقی";

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
    >
      <path
        d="M4 7.5C4 6.12 5.12 5 6.5 5H19C19.55 5 20 5.45 20 6V18C20 18.55 19.55 19 19 19H6.5C5.12 19 4 17.88 4 16.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M4 8H18.5C19.33 8 20 8.67 20 9.5V14.5C20 15.33 19.33 16 18.5 16H16C14.34 16 13 14.66 13 13C13 11.34 14.34 10 16 10H20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="13" r="0.8" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4.5 w-4.5"
    >
      {direction === "up" ? (
        <>
          <path
            d="M12 19V5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M6 11L12 5L18 11"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M12 5V19"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M6 13L12 19L18 13"
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

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M7 14H11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatToman(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

function formatCardNumber(cardNumber: string) {
  const clean = String(cardNumber || "").replace(/\D/g, "");

  if (clean.length !== 16) {
    return cardNumber || "";
  }

  return `${clean.slice(0, 4)} **** **** ${clean.slice(12)}`;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet>({ balance: 0 });
  const [cards, setCards] = useState<Card[]>([]);
  const [action, setAction] = useState<ActionType>("none");
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("gaming_account_token");

    if (!token) {
      window.location.href = "/profile";
      return;
    }

    try {
      const walletResponse = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          action: "get",
        }),
      });

      const walletData = await walletResponse.json();

      if (!walletResponse.ok || !walletData?.success) {
        setError(
          walletData?.error || "دریافت موجودی کیف پول ناموفق بود."
        );
        return;
      }

      setWallet({
        balance: Number(walletData.wallet?.balance || 0),
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
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok || profileData?.success === false) {
        setError(
          profileData?.error || "دریافت کارت‌های بانکی ناموفق بود."
        );
        return;
      }

      const userCards = Array.isArray(profileData?.cards)
        ? profileData.cards
        : [];

      setCards(userCards);
    } catch (err) {
      console.error("Wallet page error:", err);
      setError("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    window.location.href = "/profile";
  }

  function selectAction(nextAction: "deposit" | "withdraw") {
    setAction(nextAction);
    setSelectedCardId(null);
    setAmount("");
    setMessage("");
    setError("");
  }

  function cancelAction() {
    setAction("none");
    setSelectedCardId(null);
    setAmount("");
    setMessage("");
    setError("");
  }

  function handleAmountChange(value: string) {
    const cleanValue = value.replace(/[^\d]/g, "");

    setAmount(cleanValue);
    setMessage("");
    setError("");

    if (!cleanValue) {
      return;
    }

    const numericAmount = Number(cleanValue);

    if (numericAmount < MIN_AMOUNT) {
      setError(
        `حداقل مبلغ ${formatToman(MIN_AMOUNT)} تومان است.`
      );
      return;
    }

    if (numericAmount > MAX_AMOUNT) {
      setError(
        `حداکثر مبلغ ${formatToman(MAX_AMOUNT)} تومان است.`
      );
    }
  }

  async function submitRequest() {
    setMessage("");
    setError("");

    const token = localStorage.getItem("gaming_account_token");

    if (!token) {
      window.location.href = "/profile";
      return;
    }

    const numericAmount = Number(amount.replace(/,/g, ""));

    if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
      setError("لطفاً مبلغ معتبر به تومان وارد کن.");
      return;
    }

    if (numericAmount < MIN_AMOUNT) {
      setError(
        `حداقل مبلغ ${formatToman(MIN_AMOUNT)} تومان است.`
      );
      return;
    }

    if (numericAmount > MAX_AMOUNT) {
      setError(
        `حداکثر مبلغ ${formatToman(MAX_AMOUNT)} تومان است.`
      );
      return;
    }

    if (!selectedCardId) {
      setError(
        action === "deposit"
          ? "لطفاً کارت مبدأ واریز را انتخاب کن."
          : "لطفاً یک کارت بانکی برای برداشت انتخاب کن."
      );
      return;
    }

    if (
      action === "withdraw" &&
      numericAmount > wallet.balance
    ) {
      setError("مبلغ برداشت بیشتر از موجودی کیف پول است.");
      return;
    }

    if (
      action === "deposit" &&
      cards.length === 0
    ) {
      setError(
        "برای ثبت درخواست واریز، ابتدا حداقل یک کارت بانکی در حساب خود ثبت کن."
      );
      return;
    }

    setSubmitting(true);

    try {
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

      if (!response.ok || !data?.success) {
        setError(
          data?.error || "ثبت درخواست ناموفق بود."
        );
        return;
      }

      setMessage(
        data.message || "درخواست با موفقیت ثبت شد."
      );

      setAmount("");
      setSelectedCardId(null);

      await loadData();
    } catch (err) {
      console.error("Wallet request error:", err);
      setError("خطایی در ارتباط با سرور رخ داد.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-950 px-4 py-8 text-white"
      >
        <div className="mx-auto max-w-2xl">
          <div className="flex min-h-[65vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-slate-800 border-t-slate-300" />

              <p className="mt-4 text-xs text-slate-500">
                در حال دریافت اطلاعات کیف پول...
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
      className="min-h-screen bg-slate-950 px-4 py-7 pb-28 text-white"
    >
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="بازگشت"
          >
            →
          </button>

          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-950 shadow-lg shadow-black/10">
                <WalletIcon />
              </div>
            </div>

            <h1 className="mt-3 text-lg font-black">
              کیف پول
            </h1>

            <p className="mt-1 text-[11px] text-slate-500">
              مدیریت موجودی و درخواست‌های مالی
            </p>
          </div>

          <div className="w-9" />
        </div>

        {/* Balance */}
        <section className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-5 shadow-lg shadow-black/10">
          <p className="text-[11px] text-slate-500">
            موجودی کیف پول
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="text-2xl font-black tracking-tight">
              {formatToman(wallet.balance)}
            </span>

            <span className="pb-0.5 text-xs text-slate-500">
              تومان
            </span>
          </div>
        </section>

        {/* Success */}
        {message && (
          <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07] px-4 py-3 text-center text-xs leading-5 text-emerald-300">
            {message}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-xl border border-red-500/15 bg-red-500/[0.07] px-4 py-3 text-center text-xs leading-5 text-red-300">
            {error}
          </div>
        )}

        {/* Action selection */}
        {action === "none" && (
          <section className="mt-6">
            <div className="mb-3">
              <h2 className="text-sm font-black">
                عملیات کیف پول
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                عملیات موردنظر خودت را انتخاب کن
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">

              {/* Deposit */}
              <button
                type="button"
                onClick={() => selectAction("deposit")}
                className="group rounded-2xl border border-white/[0.07] bg-slate-900/70 px-4 py-4 text-right transition hover:border-white/[0.13] hover:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-950">
                    <ArrowIcon direction="down" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">
                      واریز
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      افزایش موجودی کیف پول
                    </p>
                  </div>

                  <div className="text-sm text-slate-600 transition group-hover:text-slate-300">
                    ←
                  </div>
                </div>
              </button>

              {/* Withdraw */}
              <button
                type="button"
                onClick={() => selectAction("withdraw")}
                className="group rounded-2xl border border-white/[0.07] bg-slate-900/70 px-4 py-4 text-right transition hover:border-white/[0.13] hover:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-950">
                    <ArrowIcon direction="up" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">
                      برداشت
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      درخواست برداشت موجودی
                    </p>
                  </div>

                  <div className="text-sm text-slate-600 transition group-hover:text-slate-300">
                    ←
                  </div>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* Action form */}
        {action !== "none" && (
          <section className="mt-6">

            {/* Title */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black">
                  {action === "deposit"
                    ? "واریز به کیف پول"
                    : "برداشت از کیف پول"}
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  مبلغ بین ۵۰ هزار تا ۱۰ میلیون تومان
                </p>
              </div>

              <button
                type="button"
                onClick={cancelAction}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                بازگشت
              </button>
            </div>

            {/* ========================= */}
            {/* DEPOSIT */}
            {/* ========================= */}

            {action === "deposit" && cards.length === 0 && (
              <div className="mb-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/[0.08] text-amber-300">
                  <CardIcon />
                </div>

                <h3 className="mt-3 text-sm font-black text-amber-200">
                  هنوز کارت بانکی ثبت نکرده‌ای
                </h3>

                <p className="mt-1.5 text-[11px] leading-5 text-amber-300/60">
                  برای واریز باید حداقل یک کارت بانکی در حساب خود ثبت کرده باشی.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = "/profile/account")
                  }
                  className="mt-4 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:bg-white"
                >
                  افزودن کارت بانکی
                </button>
              </div>
            )}

            {action === "deposit" && cards.length > 0 && (
              <>
                {/* Destination card FIRST */}
                <div className="mb-4 rounded-2xl border border-white/[0.07] bg-slate-900/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-950">
                      <CardIcon />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        کارت مقصد
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        مبلغ را به این کارت واریز کن
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-800/70 p-3.5">
                    <p className="text-[10px] text-slate-500">
                      نام صاحب کارت
                    </p>

                    <p className="mt-1 text-sm font-black">
                      {DEPOSIT_CARD_OWNER}
                    </p>

                    <p className="mt-3 text-[10px] text-slate-500">
                      شماره کارت
                    </p>

                    <p
                      dir="ltr"
                      className="mt-1.5 text-center text-base font-black tracking-wider"
                    >
                      {DEPOSIT_CARD_NUMBER}
                    </p>
                  </div>

                  <div className="mt-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-3.5 py-3">
                    <p className="text-xs font-bold text-amber-200">
                      ⏱️ فرصت واریز ۱۵ دقیقه است
                    </p>

                    <p className="mt-1.5 text-[10px] leading-5 text-amber-300/60">
                      بعد از ثبت درخواست، مبلغ انتخاب‌شده را حداکثر تا ۱۵ دقیقه به کارت بالا واریز کن تا درخواستت بررسی شود.
                    </p>
                  </div>
                </div>

                {/* Source card SECOND */}
                <div className="mb-4">
                  <p className="mb-2.5 text-xs font-bold">
                    کارت مبدأ واریز را انتخاب کن
                  </p>

                  <p className="mb-3 text-[10px] leading-5 text-slate-500">
                    کارت بانکی‌ای را انتخاب کن که مبلغ را از آن به کارت مقصد بالا واریز می‌کنی.
                  </p>

                  <div className="space-y-2">
                    {cards.map((card) => {
                      const selected =
                        selectedCardId === card.id;

                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            setSelectedCardId(card.id);
                            setError("");
                            setMessage("");
                          }}
                          className={`w-full rounded-2xl border p-3.5 text-right transition ${
                            selected
                              ? "border-white/[0.3] bg-slate-800"
                              : "border-white/[0.07] bg-slate-900/70 hover:border-white/[0.13]"
                          }`}
                        >
                          <div className="flex items-center gap-3">

                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                selected
                                  ? "bg-slate-100 text-slate-950"
                                  : "bg-white/[0.04] text-slate-400"
                              }`}
                            >
                              <CardIcon />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                dir="ltr"
                                className="text-left text-sm font-black tracking-wider"
                              >
                                {formatCardNumber(
                                  card.cardNumber
                                )}
                              </p>

                              <p className="mt-1.5 text-[10px] text-slate-500">
                                به نام:{" "}
                                <span className="text-slate-300">
                                  {card.ownerName}
                                </span>
                              </p>
                            </div>

                            <div
                              className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-white bg-white"
                                  : "border-slate-700"
                              }`}
                            >
                              {selected && (
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Important warning */}
                <div className="mb-4 rounded-2xl border border-red-500/15 bg-red-500/[0.06] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/[0.08] text-red-300">
                      ⚠️
                    </div>

                    <div>
                      <p className="text-xs font-black text-red-200">
                        هشدار مهم
                      </p>

                      <p className="mt-1.5 text-[10px] leading-5 text-red-300/70">
                        در انتخاب کارت مبدأ دقت کنید. انتخاب کارت اشتباه ممکن است باعث از دست رفتن وجه شود. قبل از تأیید درخواست، اطلاعات کارت را به‌دقت بررسی کنید.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========================= */}
            {/* WITHDRAW */}
            {/* ========================= */}

            {action === "withdraw" &&
              cards.length === 0 && (
                <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] p-5 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/[0.08] text-amber-300">
                    <CardIcon />
                  </div>

                  <h3 className="mt-3 text-sm font-black text-amber-200">
                    هنوز کارت بانکی ثبت نکرده‌ای
                  </h3>

                  <p className="mt-1.5 text-[11px] leading-5 text-amber-300/60">
                    ابتدا از بخش اطلاعات حساب کاربری یک کارت بانکی اضافه کن.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href =
                        "/profile/account")
                    }
                    className="mt-4 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:bg-white"
                  >
                    افزودن کارت بانکی
                  </button>
                </div>
              )}

            {action === "withdraw" &&
              cards.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2.5 text-xs font-bold">
                    کارت مقصد را انتخاب کن
                  </p>

                  <div className="space-y-2">
                    {cards.map((card) => {
                      const selected =
                        selectedCardId === card.id;

                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            setSelectedCardId(card.id);
                            setError("");
                            setMessage("");
                          }}
                          className={`w-full rounded-2xl border p-3.5 text-right transition ${
                            selected
                              ? "border-white/[0.3] bg-slate-800"
                              : "border-white/[0.07] bg-slate-900/70 hover:border-white/[0.13]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                selected
                                  ? "bg-slate-100 text-slate-950"
                                  : "bg-white/[0.04] text-slate-400"
                              }`}
                            >
                              <CardIcon />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                dir="ltr"
                                className="text-left text-sm font-black tracking-wider"
                              >
                                {formatCardNumber(
                                  card.cardNumber
                                )}
                              </p>

                              <p className="mt-1.5 text-[10px] text-slate-500">
                                به نام:{" "}
                                <span className="text-slate-300">
                                  {card.ownerName}
                                </span>
                              </p>
                            </div>

                            <div
                              className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-white bg-white"
                                  : "border-slate-700"
                              }`}
                            >
                              {selected && (
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* ========================= */}
            {/* AMOUNT */}
            {/* ========================= */}

            {((action === "deposit" &&
              cards.length > 0 &&
              selectedCardId !== null) ||
              (action === "withdraw" &&
                cards.length > 0)) && (
              <div className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-4">

                <label className="mb-2.5 block text-xs font-bold">
                  مبلغ{" "}
                  {action === "deposit"
                    ? "واریز"
                    : "برداشت"}{" "}
                  به تومان
                </label>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) =>
                      handleAmountChange(
                        e.target.value
                      )
                    }
                    placeholder="مثلاً ۵۰۰۰۰۰"
                    dir="ltr"
                    className="w-full rounded-xl border border-white/[0.07] bg-slate-800/70 px-3.5 py-3.5 pl-16 text-left text-base font-bold text-white outline-none placeholder:text-slate-600 focus:border-white/[0.2]"
                  />

                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                    تومان
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-600">
                  <span>
                    حداقل:{" "}
                    {formatToman(MIN_AMOUNT)}
                  </span>

                  <span>
                    حداکثر:{" "}
                    {formatToman(MAX_AMOUNT)}
                  </span>
                </div>

                {amount && (
                  <p className="mt-2.5 text-[11px] text-slate-500">
                    مبلغ واردشده:{" "}
                    <span className="font-bold text-slate-300">
                      {formatToman(
                        Number(amount)
                      )}{" "}
                      تومان
                    </span>
                  </p>
                )}

                {action === "withdraw" && (
                  <div className="mt-3 rounded-xl bg-slate-800/70 px-3.5 py-2.5 text-[11px] text-slate-500">
                    موجودی فعلی:{" "}
                    <span className="font-bold text-slate-200">
                      {formatToman(
                        wallet.balance
                      )}{" "}
                      تومان
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={submitRequest}
                  disabled={
                    submitting ||
                    !amount ||
                    Number(amount) <
                      MIN_AMOUNT ||
                    Number(amount) >
                      MAX_AMOUNT ||
                    !selectedCardId
                  }
                  className="mt-4 w-full rounded-xl bg-slate-100 py-3.5 text-sm font-black text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {submitting
                    ? "در حال ثبت درخواست..."
                    : action === "deposit"
                    ? "ثبت درخواست واریز"
                    : "تأیید درخواست برداشت"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Back to profile */}
        {action === "none" && (
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-slate-900/60 py-3 text-xs font-bold text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <span>→</span>
            بازگشت به پروفایل
          </button>
        )}
      </div>
    </main>
  );
}