"use client";

import { useEffect, useState } from "react";

type BankCard = {
id: number;
cardNumber: string;
ownerName: string;
};

type ProfileData = {
profile?: {
firstName?: string | null;
lastName?: string | null;
mobile?: string | null;
} | null;
cards?: BankCard[];
};

function UserIcon() {
return ( <svg
   viewBox="0 0 24 24"
   fill="none"
   className="h-5 w-5"
   xmlns="http://www.w3.org/2000/svg"
 > <circle
     cx="12"
     cy="8"
     r="3.2"
     stroke="currentColor"
     strokeWidth="1.7"
   /> <path
     d="M5.5 20C6.1 16.5 8.2 14.5 12 14.5C15.8 14.5 17.9 16.5 18.5 20"
     stroke="currentColor"
     strokeWidth="1.7"
     strokeLinecap="round"
   /> </svg>
);
}

function CardIcon() {
return ( <svg
   viewBox="0 0 24 24"
   fill="none"
   className="h-5 w-5"
   xmlns="http://www.w3.org/2000/svg"
 > <rect
     x="3"
     y="5"
     width="18"
     height="14"
     rx="2.5"
     stroke="currentColor"
     strokeWidth="1.7"
   /> <path
     d="M3 9H21"
     stroke="currentColor"
     strokeWidth="1.7"
   /> <path
     d="M7 14H11"
     stroke="currentColor"
     strokeWidth="1.7"
     strokeLinecap="round"
   /> </svg>
);
}

function ArrowIcon() {
return ( <svg
   viewBox="0 0 24 24"
   fill="none"
   className="h-4 w-4"
   xmlns="http://www.w3.org/2000/svg"
 > <path
     d="M9 5L16 12L9 19"
     stroke="currentColor"
     strokeWidth="1.8"
     strokeLinecap="round"
     strokeLinejoin="round"
   /> </svg>
);
}

function TrashIcon() {
return ( <svg
   viewBox="0 0 24 24"
   fill="none"
   className="h-4 w-4"
   xmlns="http://www.w3.org/2000/svg"
 > <path
     d="M5 7H19"
     stroke="currentColor"
     strokeWidth="1.7"
     strokeLinecap="round"
   /> <path
     d="M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7"
     stroke="currentColor"
     strokeWidth="1.7"
     strokeLinecap="round"
   /> <path
     d="M7 7L7.8 19C7.87 20.12 8.8 21 9.92 21H14.08C15.2 21 16.13 20.12 16.2 19L17 7"
     stroke="currentColor"
     strokeWidth="1.7"
     strokeLinejoin="round"
   /> <path
     d="M10 11V17"
     stroke="currentColor"
     strokeWidth="1.7"
     strokeLinecap="round"
   /> <path
     d="M14 11V17"
     stroke="currentColor"
     strokeWidth="1.7"
     strokeLinecap="round"
   /> </svg>
);
}

function formatCardNumber(cardNumber: string) {
const clean = cardNumber.replace(/\s/g, "");

return clean.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export default function AccountPage() {
const [loading, setLoading] = useState(true);
const [savingProfile, setSavingProfile] = useState(false);
const [savingCard, setSavingCard] = useState(false);

const [message, setMessage] = useState("");
const [error, setError] = useState("");

const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [mobile, setMobile] = useState("");

const [cards, setCards] = useState<BankCard[]>([]);

const [newCardNumber, setNewCardNumber] = useState("");
const [newOwnerName, setNewOwnerName] = useState("");

const [addingCard, setAddingCard] = useState(false);

useEffect(() => {
loadProfile();
}, []);

async function loadProfile() {
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
  const response = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      action: "get",
    }),
  });

  const data: ProfileData = await response.json();

  if (!response.ok) {
    throw new Error(
      (data as any)?.error ||
        "دریافت اطلاعات حساب ناموفق بود."
    );
  }

  const profile = data.profile || null;

  setFirstName(profile?.firstName || "");
  setLastName(profile?.lastName || "");
  setMobile(profile?.mobile || "");

  setCards(
    Array.isArray(data.cards) ? data.cards : []
  );
} catch (err) {
  console.error(err);

  setError(
    err instanceof Error
      ? err.message
      : "خطایی در دریافت اطلاعات رخ داد."
  );
} finally {
  setLoading(false);
}


}

async function saveProfile() {
setMessage("");
setError("");


if (!firstName.trim()) {
  setError("نام را وارد کنید.");
  return;
}

if (!lastName.trim()) {
  setError("نام خانوادگی را وارد کنید.");
  return;
}

if (!mobile.trim()) {
  setError("شماره موبایل را وارد کنید.");
  return;
}

const token = localStorage.getItem(
  "gaming_account_token"
);

if (!token) {
  window.location.href = "/profile";
  return;
}

setSavingProfile(true);

try {
  const response = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      action: "save_profile",
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobile: mobile.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "ذخیره اطلاعات ناموفق بود."
    );
  }

  setMessage(
    "اطلاعات حساب با موفقیت ذخیره شد."
  );
} catch (err) {
  console.error(err);

  setError(
    err instanceof Error
      ? err.message
      : "خطایی در ذخیره اطلاعات رخ داد."
  );
} finally {
  setSavingProfile(false);
}


}

function addCardBox() {
setAddingCard(true);
setNewCardNumber("");
setNewOwnerName("");
setMessage("");
setError("");
}

function cancelAddCard() {
setAddingCard(false);
setNewCardNumber("");
setNewOwnerName("");
}

async function saveCard() {
setMessage("");
setError("");


const cardNumber = newCardNumber
  .replace(/\s/g, "")
  .trim();

const ownerName = newOwnerName.trim();

if (!cardNumber) {
  setError("شماره کارت را وارد کنید.");
  return;
}

if (cardNumber.length !== 16) {
  setError("شماره کارت باید ۱۶ رقم باشد.");
  return;
}

if (!/^\d+$/.test(cardNumber)) {
  setError(
    "شماره کارت فقط باید شامل اعداد باشد."
  );
  return;
}

if (!ownerName) {
  setError("نام مالک کارت را وارد کنید.");
  return;
}

const token = localStorage.getItem(
  "gaming_account_token"
);

if (!token) {
  window.location.href = "/profile";
  return;
}

setSavingCard(true);

try {
  const response = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      action: "add_card",
      cardNumber,
      ownerName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "ذخیره کارت ناموفق بود."
    );
  }

  const cardId = Number(data?.cardId);

  if (Number.isInteger(cardId)) {
    setCards((current) => [
      ...current,
      {
        id: cardId,
        cardNumber,
        ownerName,
      },
    ]);
  } else {
    await loadProfile();
  }

  setNewCardNumber("");
  setNewOwnerName("");
  setAddingCard(false);

  setMessage(
    "کارت بانکی با موفقیت اضافه شد."
  );
} catch (err) {
  console.error(err);

  setError(
    err instanceof Error
      ? err.message
      : "خطایی در ذخیره کارت رخ داد."
  );
} finally {
  setSavingCard(false);
}


}

async function deleteCard(cardId: number) {
const confirmed = window.confirm(
"آیا از حذف این کارت مطمئن هستید؟"
);


if (!confirmed) {
  return;
}

setMessage("");
setError("");

const token = localStorage.getItem(
  "gaming_account_token"
);

if (!token) {
  window.location.href = "/profile";
  return;
}

try {
  const response = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      action: "delete_card",
      cardId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "حذف کارت ناموفق بود."
    );
  }

  setCards((current) =>
    current.filter(
      (card) => card.id !== cardId
    )
  );

  setMessage("کارت با موفقیت حذف شد.");
} catch (err) {
  console.error(err);

  setError(
    err instanceof Error
      ? err.message
      : "خطایی در حذف کارت رخ داد."
  );
}


}

function goBack() {
window.location.href = "/profile";
}

if (loading) {
return ( <main
     dir="rtl"
     className="min-h-screen bg-slate-950 px-4 py-10 text-white"
   > <div className="mx-auto max-w-2xl"> <div className="flex min-h-[60vh] items-center justify-center"> <div className="text-center"> <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-white" />


          <p className="mt-4 text-xs text-slate-500">
            در حال دریافت اطلاعات...
          </p>
        </div>
      </div>
    </div>
  </main>
);


}

return ( <main
   dir="rtl"
   className="min-h-screen bg-slate-950 px-4 py-7 pb-16 text-white"
 > <div className="mx-auto max-w-2xl">


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
            <UserIcon />
          </div>
        </div>

        <h1 className="mt-3 text-lg font-bold">
          اطلاعات حساب کاربری
        </h1>

        <p className="mt-1 text-[11px] text-slate-600">
          مدیریت اطلاعات شخصی و کارت‌های بانکی
        </p>
      </div>

      <div className="w-9" />
    </div>

    {/* Error */}
    {error && (
      <div className="mb-4 rounded-2xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-center text-xs text-red-300">
        {error}
      </div>
    )}

    {/* Profile */}
    <section className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-4 shadow-lg">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07] text-slate-300">
          <UserIcon />
        </div>

        <div>
          <h2 className="text-sm font-bold">
            اطلاعات شخصی
          </h2>

          <p className="mt-1 text-[11px] text-slate-600">
            اطلاعات خودت را وارد یا ویرایش کن
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            نام
          </label>

          <input
            type="text"
            value={firstName}
            onChange={(e) =>
              setFirstName(e.target.value)
            }
            placeholder="نام"
            className="w-full rounded-xl border border-white/[0.07] bg-slate-950/60 px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-white/20 focus:bg-slate-950"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            نام خانوادگی
          </label>

          <input
            type="text"
            value={lastName}
            onChange={(e) =>
              setLastName(e.target.value)
            }
            placeholder="نام خانوادگی"
            className="w-full rounded-xl border border-white/[0.07] bg-slate-950/60 px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-white/20 focus:bg-slate-950"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            شماره موبایل
          </label>

          <input
            type="tel"
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value)
            }
            placeholder="09123456789"
            dir="ltr"
            className="w-full rounded-xl border border-white/[0.07] bg-slate-950/60 px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-white/20 focus:bg-slate-950"
          />
        </div>

        <button
          type="button"
          onClick={saveProfile}
          disabled={savingProfile}
          className="w-full rounded-xl bg-white py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {savingProfile
            ? "در حال ذخیره..."
            : "ذخیره اطلاعات"}
        </button>
      </div>
    </section>

    {/* Bank cards */}
    <section className="mt-4 rounded-2xl border border-white/[0.07] bg-slate-900/70 p-4 shadow-lg">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07] text-slate-300">
          <CardIcon />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold">
            کارت‌های بانکی
          </h2>

          <p className="mt-1 text-[11px] text-slate-600">
            کارت‌های ثبت‌شده برای حساب کاربری
          </p>
        </div>
      </div>

      {cards.length === 0 &&
        !addingCard && (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-6 text-center">
            <p className="text-xs font-medium text-slate-400">
              هنوز کارت بانکی ثبت نکرده‌ای
            </p>

            <p className="mt-1.5 text-[11px] text-slate-600">
              می‌توانی کارت خودت را اضافه کنی.
            </p>
          </div>
        )}

      <div className="space-y-2.5">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-white/[0.07] bg-slate-950/50 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-slate-400">
                <CardIcon />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  dir="ltr"
                  className="text-left text-xs font-bold tracking-wider text-slate-300"
                >
                  {formatCardNumber(
                    card.cardNumber
                  )}
                </p>

                <p className="mt-1 text-[11px] text-slate-600">
                  {card.ownerName}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  deleteCard(card.id)
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/[0.06] text-red-400/70 transition hover:bg-red-500/10 hover:text-red-300"
                aria-label="حذف کارت"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add card */}
      {addingCard ? (
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-slate-950/50 p-3.5">
          <h3 className="mb-4 text-sm font-bold">
            افزودن کارت جدید
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                شماره کارت
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={newCardNumber}
                onChange={(e) =>
                  setNewCardNumber(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="6037991234567890"
                dir="ltr"
                className="w-full rounded-xl border border-white/[0.07] bg-slate-900 px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-white/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                نام مالک کارت
              </label>

              <input
                type="text"
                value={newOwnerName}
                onChange={(e) =>
                  setNewOwnerName(
                    e.target.value
                  )
                }
                placeholder="نام و نام خانوادگی مالک کارت"
                className="w-full rounded-xl border border-white/[0.07] bg-slate-900 px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-white/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={cancelAddCard}
                disabled={savingCard}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-3 text-xs font-bold text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={saveCard}
                disabled={savingCard}
                className="rounded-xl bg-white py-3 text-xs font-bold text-slate-950 transition hover:bg-slate-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingCard
                  ? "در حال ذخیره..."
                  : "ذخیره کارت"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={addCardBox}
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition hover:border-white/[0.14] hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.07] text-base font-medium text-slate-300">
              +
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-slate-300">
                افزودن کارت بانکی
              </p>

              <p className="mt-1 text-[10px] text-slate-600">
                ثبت یک کارت جدید
              </p>
            </div>
          </div>

          <ArrowIcon />
        </button>
      )}
    </section>

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
      <div className="fixed bottom-6 left-1/2 z-[300] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-center text-xs font-medium text-white shadow-2xl backdrop-blur">
        {message}
      </div>
    )}
  </div>
</main>


);
}
