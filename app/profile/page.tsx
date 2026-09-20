"use client";

import { useEffect, useState } from "react";

type Mode = "login" | "register";

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
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

function UserInfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
    >
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5.5 20C6.1 16.5 8.2 14.5 12 14.5C15.8 14.5 17.9 16.5 18.5 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
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

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
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

export default function ProfilePage() {
  const [mode, setMode] =
    useState<Mode>("login");

  const [name, setName] = useState("");
  const [identifier, setIdentifier] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [repeatPassword, setRepeatPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showRepeatPassword, setShowRepeatPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);
  const [message, setMessage] =
    useState("");

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);
  const [userName, setUserName] =
    useState("");

  useEffect(() => {
    const token = localStorage.getItem(
      "gaming_account_token"
    );

    const user = localStorage.getItem(
      "gaming_account_user"
    );

    if (token && user) {
      try {
        const userData =
          JSON.parse(user);

        setIsLoggedIn(true);
        setUserName(
          userData.name || ""
        );
      } catch {
        localStorage.removeItem(
          "gaming_account_token"
        );

        localStorage.removeItem(
          "gaming_account_user"
        );
      }
    }
  }, []);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setMessage("");

    if (
      mode === "register" &&
      password !== repeatPassword
    ) {
      setMessage(
        "رمز عبور و تکرار رمز یکسان نیستند."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        mode === "register"
          ? "/api/auth/register"
          : "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            mode === "register"
              ? {
                  name,
                  identifier,
                  password,
                }
              : {
                  identifier,
                  password,
                }
          ),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.error ||
            "عملیات ناموفق بود."
        );
        return;
      }

      if (mode === "login") {
        localStorage.setItem(
          "gaming_account_token",
          data.token
        );

        localStorage.setItem(
          "gaming_account_user",
          JSON.stringify({
            userId: data.userId,
            name: data.name,
          })
        );

        setIsLoggedIn(true);
        setUserName(data.name);
        setMessage(
          `خوش آمدی ${data.name}`
        );
        setPassword("");
      } else {
        setMessage(
          "ثبت‌نام با موفقیت انجام شد. حالا می‌توانی وارد شوی."
        );

        setMode("login");
        setPassword("");
        setRepeatPassword("");
      }
    } catch {
      setMessage(
        "خطایی در ارتباط با سرور رخ داد."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(
      "gaming_account_token"
    );

    localStorage.removeItem(
      "gaming_account_user"
    );

    setIsLoggedIn(false);
    setUserName("");
    setMessage(
      "از حساب خارج شدی"
    );
  }

  function goTo(path: string) {
    window.location.href = path;
  }

  if (isLoggedIn) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-950 px-4 py-8 pb-10 text-white"
      >
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between gap-3">
            <button
              onClick={() =>
                goTo("/")
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-white/10"
              aria-label="بازگشت"
            >
              →
            </button>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950">
                  <UserInfoIcon />
                </div>
              </div>

              <h1 className="mt-3 text-xl font-black">
                پروفایل
              </h1>
            </div>

            <div className="w-10" />
          </div>

          {/* User card */}
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                <UserInfoIcon />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  خوش آمدی
                </p>

                <h2 className="mt-1 truncate text-xl font-black">
                  {userName}
                </h2>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-5 w-full rounded-2xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
            >
              خروج از حساب
            </button>
          </div>

          {/* Menu */}
          <section className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-black">
                حساب کاربری
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                بخش موردنظر خودت را انتخاب کن
              </p>
            </div>

            <div className="space-y-3">
              {/* Account information */}
              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/profile/account"
                  )
                }
                className="group flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-slate-900 p-5 text-right shadow-xl transition hover:border-white/20 hover:bg-slate-800"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                  <UserInfoIcon />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-black">
                    اطلاعات حساب کاربری
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    نام، شماره موبایل و کارت‌های بانکی
                  </p>
                </div>

                <div className="text-slate-500 transition group-hover:text-white">
                  <ArrowIcon />
                </div>
              </button>

              {/* Saved accounts */}
              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/profile/saved"
                  )
                }
                className="group flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-slate-900 p-5 text-right shadow-xl transition hover:border-white/20 hover:bg-slate-800"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                  <BookmarkIcon />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-black">
                    اکانت‌های ذخیره‌شده
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    اکانت‌هایی که برای بعد ذخیره کرده‌ای
                  </p>
                </div>

                <div className="text-slate-500 transition group-hover:text-white">
                  <ArrowIcon />
                </div>
              </button>

              {/* Purchased accounts */}
              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/profile/purchases"
                  )
                }
                className="group flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-slate-900 p-5 text-right shadow-xl transition hover:border-white/20 hover:bg-slate-800"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                  <CartIcon />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-black">
                    اکانت‌های خریداری‌شده
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    مشاهده اکانت‌ها و اطلاعات خریدهای قبلی
                  </p>
                </div>

                <div className="text-slate-500 transition group-hover:text-white">
                  <ArrowIcon />
                </div>
              </button>
            </div>
          </section>

          {message && (
            <div className="fixed bottom-6 left-1/2 z-[300] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white shadow-2xl">
              {message}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 px-4 py-8 text-white"
    >
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-950">
              <UserInfoIcon />
            </div>
          </div>

          <h1 className="text-2xl font-black">
            {mode === "login"
              ? "ورود به حساب"
              : "ساخت حساب"}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {mode === "login"
              ? "برای ادامه وارد حساب خودت شو"
              : "حساب کاربری خودت را بساز"}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`rounded-xl py-3 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ورود
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
              className={`rounded-xl py-3 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ثبت‌نام
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {mode === "register" && (
              <div>
                <label className="mb-2 block text-sm font-bold">
                  نام و نام خانوادگی
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="مثلاً محمد سراغی"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold">
                ایمیل یا شماره موبایل
              </label>

              <input
                type="text"
                value={identifier}
                onChange={(e) =>
                  setIdentifier(
                    e.target.value
                  )
                }
                placeholder="ایمیل یا شماره موبایل"
                dir="ltr"
                className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                رمز عبور
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="حداقل ۶ کاراکتر"
                  dir="ltr"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 pl-12 text-white outline-none placeholder:text-slate-500 focus:border-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-white"
                  aria-label={
                    showPassword
                      ? "مخفی کردن رمز"
                      : "نمایش رمز"
                  }
                >
                  <EyeIcon
                    visible={
                      showPassword
                    }
                  />
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="mb-2 block text-sm font-bold">
                  تکرار رمز عبور
                </label>

                <div className="relative">
                  <input
                    type={
                      showRepeatPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      repeatPassword
                    }
                    onChange={(e) =>
                      setRepeatPassword(
                        e.target.value
                      )
                    }
                    placeholder="رمز عبور را دوباره وارد کن"
                    dir="ltr"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 pl-12 text-white outline-none placeholder:text-slate-500 focus:border-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowRepeatPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-white"
                    aria-label={
                      showRepeatPassword
                        ? "مخفی کردن رمز"
                        : "نمایش رمز"
                    }
                  >
                    <EyeIcon
                      visible={
                        showRepeatPassword
                      }
                    />
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className="rounded-2xl bg-slate-800 px-4 py-3 text-center text-sm text-slate-200">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-white py-3.5 font-black text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "لطفاً صبر کن..."
                : mode === "login"
                ? "ورود به حساب"
                : "ساخت حساب"}
            </button>
          </form>
        </div>

        <button
          onClick={() =>
            goTo("/")
          }
          className="mt-5 w-full text-center text-sm text-slate-500 transition hover:text-white"
        >
          ← بازگشت به فروشگاه
        </button>
      </div>
    </main>
  );
}