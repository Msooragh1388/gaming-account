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
      className="h-7 w-7"
    >
      <path
        d="M4 7.5C4 6.12 5.12 5 6.5 5H19C19.55 5 20 5.45 20 6V18C20 18.55 19.55 19 19 19H6.5C5.12 19 4 17.88 4 16.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M4 8H18.5C19.33 8 20 8.67 20 9.5V14.5C20 15.33 19.33 16 18.5 16H16C14.34 16 13 14.66 13 13C13 11.34 14.34 10 16 10H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="16"
        cy="13"
        r="0.8"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowIcon({
  direction,
}: {
  direction: "up" | "down";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
    >
      {direction === "up" ? (
        <>
          <path
            d="M12 19V5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <path
            d="M6 11L12 5L18 11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M12 5V19"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <path
            d="M6 13L12 19L18 13"
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

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M3 9H21"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M7 14H11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatToman(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

function formatCardNumber(cardNumber: string) {
  const clean = String(cardNumber || "").replace(
    /\D/g,
    ""
  );

  if (clean.length !== 16) {
    return cardNumber || "";
  }

  return `${clean.slice(0, 4)} **** **** ${clean.slice(
    12
  )}`;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet>({
    balance: 0,
  });

  const [cards, setCards] = useState<Card[]>([]);

  const [action, setAction] =
    useState<ActionType>("none");

  const [selectedCardId, setSelectedCardId] =
    useState<number | null>(null);

  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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
      const walletResponse = await fetch(
        "/api/wallet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            action: "get",
          }),
        }
      );

      const walletData =
        await walletResponse.json();

      if (
        !walletResponse.ok ||
        !walletData?.success
      ) {
        setError(
          walletData?.error ||
            "دریافت موجودی کیف پول ناموفق بود."
        );
        return;
      }

      setWallet({
        balance: Number(
          walletData.wallet?.balance || 0
        ),
      });

      const profileResponse =
        await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token,
            action: "get",
          }),
        });

      const profileData =
        await profileResponse.json();

      if (
        !profileResponse.ok ||
        profileData?.success === false
      ) {
        setError(
          profileData?.error ||
            "دریافت کارت‌های بانکی ناموفق بود."
        );
        return;
      }

      const userCards = Array.isArray(
        profileData?.cards
      )
        ? profileData.cards
        : [];

      setCards(userCards);
    } catch (err) {
      console.error(
        "Wallet page error:",
        err
      );

      setError(
        "خطایی در ارتباط با سرور رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    window.location.href = "/profile";
  }

  function selectAction(
    nextAction: "deposit" | "withdraw"
  ) {
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
    const cleanValue = value.replace(
      /[^\d]/g,
      ""
    );

    setAmount(cleanValue);
    setMessage("");
    setError("");

    if (!cleanValue) {
      return;
    }

    const numericAmount = Number(cleanValue);

    if (numericAmount < MIN_AMOUNT) {
      setError(
        `حداقل مبلغ ${formatToman(
          MIN_AMOUNT
        )} تومان است.`
      );
      return;
    }

    if (numericAmount > MAX_AMOUNT) {
      setError(
        `حداکثر مبلغ ${formatToman(
          MAX_AMOUNT
        )} تومان است.`
      );
    }
  }

  async function submitRequest() {
    setMessage("");
    setError("");

    const token = localStorage.getItem(
      "gaming_account_token"
    );

    if (!token) {
      window.location.href = "/profile";
      return;
    }

    const numericAmount = Number(
      amount.replace(/,/g, "")
    );

    if (
      !Number.isInteger(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        "لطفاً مبلغ معتبر به تومان وارد کن."
      );
      return;
    }

    if (numericAmount < MIN_AMOUNT) {
      setError(
        `حداقل مبلغ ${formatToman(
          MIN_AMOUNT
        )} تومان است.`
      );
      return;
    }

    if (numericAmount > MAX_AMOUNT) {
      setError(
        `حداکثر مبلغ ${formatToman(
          MAX_AMOUNT
        )} تومان است.`
      );
      return;
    }

    if (
      action === "withdraw" &&
      !selectedCardId
    ) {
      setError(
        "لطفاً یک کارت بانکی برای برداشت انتخاب کن."
      );
      return;
    }

    if (
      action === "withdraw" &&
      numericAmount > wallet.balance
    ) {
      setError(
        "مبلغ برداشت بیشتر از موجودی کیف پول است."
      );
      return;
    }

    /*
      برای واریز، کارت مقصد کارت شماست.
      برای برداشت، کارت انتخاب‌شده کاربر ارسال می‌شود.
    */
    const cardId =
      action === "withdraw"
        ? selectedCardId
        : selectedCardId;

    if (
      action === "deposit" &&
      cards.length === 0
    ) {
      setError(
        "برای ثبت درخواست واریز، ابتدا حداقل یک کارت بانکی در حساب خود ثبت کن."
      );
      return;
    }

    if (!cardId) {
      setError(
        "لطفاً کارت بانکی را انتخاب کن."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/wallet",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token,
            action,
            amount: numericAmount,
            cardId,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.success
      ) {
        setError(
          data?.error ||
            "ثبت درخواست ناموفق بود."
        );
        return;
      }

      setMessage(
        data.message ||
          "درخواست با موفقیت ثبت شد."
      );

      setAmount("");
      setSelectedCardId(null);

      await loadData();
    } catch (err) {
      console.error(
        "Wallet request error:",
        err
      );

      setError(
        "خطایی در ارتباط با سرور رخ داد."
      );
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
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-white" />

              <p className="mt-4 text-sm text-slate-400">
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
      className="min-h-screen bg-slate-950 px-4 py-8 pb-12 text-white"
    >
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-white/10"
            aria-label="بازگشت"
          >
            →
          </button>

          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950">
                <WalletIcon />
              </div>
            </div>

            <h1 className="mt-3 text-xl font-black">
              کیف پول
            </h1>
          </div>

          <div className="w-10" />
        </div>

        {/* Balance */}
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <p className="text-sm text-slate-500">
            موجودی کیف پول
          </p>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-black">
              {formatToman(
                wallet.balance
              )}
            </span>

            <span className="pb-1 text-sm text-slate-500">
              تومان
            </span>
          </div>
        </div>

        {/* Success */}
        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm leading-6 text-emerald-300">
            {message}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm leading-6 text-red-300">
            {error}
          </div>
        )}

        {/* Main buttons */}
        {action === "none" && (
          <section className="mt-6">
            <div className="mb-4">
              <h2 className="text-lg font-black">
                عملیات کیف پول
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                عملیات موردنظر خودت را انتخاب کن
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {/* واریز - فلش پایین */}
              <button
                type="button"
                onClick={() =>
                  selectAction("deposit")
                }
                className="group rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-right shadow-lg transition hover:border-white/20 hover:bg-slate-800"
              >
                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950">
                    <ArrowIcon direction="down" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold">
                      واریز
                    </h3>

                    <p className="mt-1 text-[11px] text-slate-500">
                      افزایش موجودی کیف پول
                    </p>
                  </div>

                  <div className="text-lg text-slate-600 transition group-hover:text-white">
                    ←
                  </div>

                </div>
              </button>

              {/* برداشت - فلش بالا */}
              <button
                type="button"
                onClick={() =>
                  selectAction("withdraw")
                }
                className="group rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-right shadow-lg transition hover:border-white/20 hover:bg-slate-800"
              >
                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950">
                    <ArrowIcon direction="up" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold">
                      برداشت
                    </h3>

                    <p className="mt-1 text-[11px] text-slate-500">
                      درخواست برداشت موجودی
                    </p>
                  </div>

                  <div className="text-lg text-slate-600 transition group-hover:text-white">
                    ←
                  </div>

                </div>
              </button>

            </div>
          </section>
        )}

        {/* Deposit / Withdraw */}
        {action !== "none" && (
          <section className="mt-6">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-black">
                  {action === "deposit"
                    ? "واریز به کیف پول"
                    : "برداشت از کیف پول"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  مبلغ بین ۵۰ هزار تا ۱۰ میلیون تومان
                </p>
              </div>

              <button
                type="button"
                onClick={cancelAction}
                className="rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                بازگشت
              </button>

            </div>

            {/* Deposit information */}
            {action === "deposit" && (
              <div className="mb-5 rounded-3xl border border-white/10 bg-slate-900 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950">
                    <CardIcon />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      کارت واریز
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      مبلغ را به کارت زیر واریز کن
                    </p>
                  </div>

                </div>

                <div className="mt-5 rounded-2xl bg-slate-800 p-4">

                  <p className="text-[11px] text-slate-500">
                    نام صاحب کارت
                  </p>

                  <p className="mt-1 text-base font-black">
                    {DEPOSIT_CARD_OWNER}
                  </p>

                  <p className="mt-4 text-[11px] text-slate-500">
                    شماره کارت
                  </p>

                  <p
                    dir="ltr"
                    className="mt-2 text-center text-lg font-black tracking-wider"
                  >
                    {DEPOSIT_CARD_NUMBER}
                  </p>

                </div>

                <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-center">

                  <p className="text-sm font-bold text-amber-200">
                    ⏱️ فرصت واریز ۱۵ دقیقه است
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-amber-300/70">
                    بعد از ثبت درخواست، لطفاً مبلغ
                    انتخاب‌شده را حداکثر تا ۱۵ دقیقه
                    به کارت بالا واریز کن تا درخواستت
                    در سریع‌ترین زمان بررسی شود.
                  </p>

                </div>

              </div>
            )}

            {/* Withdraw cards */}
            {action === "withdraw" &&
              cards.length === 0 && (
                <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300">
                    <CardIcon />
                  </div>

                  <h3 className="mt-4 font-black text-amber-200">
                    هنوز کارت بانکی ثبت نکرده‌ای
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-amber-300/70">
                    ابتدا از بخش اطلاعات حساب کاربری
                    یک کارت بانکی اضافه کن.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href =
                        "/profile/account")
                    }
                    className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
                  >
                    افزودن کارت بانکی
                  </button>

                </div>
              )}

            {/* Withdraw card selection */}
            {action === "withdraw" &&
              cards.length > 0 && (
                <div className="mb-5">

                  <p className="mb-3 text-sm font-bold">
                    کارت مقصد را انتخاب کن
                  </p>

                  <div className="space-y-3">

                    {cards.map((card) => {
                      const selected =
                        selectedCardId ===
                        card.id;

                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() =>
                            setSelectedCardId(
                              card.id
                            )
                          }
                          className={`w-full rounded-3xl border p-5 text-right transition ${
                            selected
                              ? "border-white bg-slate-800"
                              : "border-white/10 bg-slate-900 hover:border-white/20"
                          }`}
                        >

                          <div className="flex items-center gap-4">

                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                                selected
                                  ? "bg-white text-slate-950"
                                  : "bg-white/5 text-slate-300"
                              }`}
                            >
                              <CardIcon />
                            </div>

                            <div className="min-w-0 flex-1">

                              <p
                                dir="ltr"
                                className="text-left text-base font-black tracking-wider"
                              >
                                {formatCardNumber(
                                  card.cardNumber
                                )}
                              </p>

                              <p className="mt-2 text-xs text-slate-500">
                                به نام:{" "}
                                <span className="text-slate-300">
                                  {card.ownerName}
                                </span>
                              </p>

                            </div>

                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-white bg-white"
                                  : "border-slate-600"
                              }`}
                            >
                              {selected && (
                                <div className="h-2 w-2 rounded-full bg-slate-950" />
                              )}
                            </div>

                          </div>

                        </button>
                      );
                    })}

                  </div>
                </div>
              )}

            {/* Amount */}
            {(action === "deposit" ||
              cards.length > 0) && (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">

                <label className="mb-3 block text-sm font-bold">
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
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-4 pl-20 text-left text-lg font-bold text-white outline-none placeholder:text-slate-600 focus:border-white"
                  />

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                    تومان
                  </span>

                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">

                  <span>
                    حداقل:{" "}
                    {formatToman(
                      MIN_AMOUNT
                    )}
                  </span>

                  <span>
                    حداکثر:{" "}
                    {formatToman(
                      MAX_AMOUNT
                    )}
                  </span>

                </div>

                {amount && (
                  <p className="mt-3 text-xs text-slate-500">
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
                  <div className="mt-4 rounded-2xl bg-slate-800 px-4 py-3 text-xs text-slate-400">
                    موجودی فعلی:{" "}
                    <span className="font-bold text-white">
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
                    (action ===
                      "withdraw" &&
                      !selectedCardId)
                  }
                  className="mt-5 w-full rounded-2xl bg-white py-4 font-black text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
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
      </div>
    </main>
  );
}