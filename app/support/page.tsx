"use client";

import { useState } from "react";

const phoneNumbers = ["09101354751", "09930806949"];
const rubikaIds = ["@SPOOKY885566", "@azhh009"];

const faqs = [
  {
    question: "چطور یک اکانت خریداری کنم؟",
    answer:
      "از صفحه محصولات، بازی و محصول موردنظر خودت را انتخاب کن و مراحل خرید را انجام بده. بعد از تکمیل موفق خرید، اطلاعات محصول در بخش خریدهای من قرار می‌گیرد.",
  },
  {
    question: "اکانت خریداری‌شده را از کجا ببینم؟",
    answer:
      "وارد پروفایل خودت شو و از قسمت «خریدهای من» می‌توانی محصولات و اکانت‌های خریداری‌شده را مشاهده کنی.",
  },
  {
    question: "چطور کیف پولم را شارژ کنم؟",
    answer:
      "از پروفایل وارد بخش «کیف پول» شو و گزینه شارژ کیف پول را انتخاب کن. سپس طبق مراحل نمایش‌داده‌شده مبلغ موردنظر را پرداخت کن.",
  },
  {
    question: "اگر در خرید یا پرداخت مشکلی پیش آمد چه کار کنم؟",
    answer:
      "اگر پرداخت یا خریدت با مشکل مواجه شد، اطلاعات مربوط به تراکنش یا خرید را نگه دار و با یکی از شماره‌ها یا آیدی‌های روبیکا در همین صفحه با پشتیبانی تماس بگیر.",
  },
  {
    question: "اگر سوال دیگری داشته باشم چطور با پشتیبانی ارتباط بگیرم؟",
    answer:
      "می‌توانی از طریق شماره‌های پشتیبانی یا آیدی‌های روبیکا که در بالای همین صفحه قرار دارند با پشتیبانی در ارتباط باشی.",
  },
];

function SupportIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H4Z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h3Z" />
      <path d="M9 19h3a2 2 0 0 0 2-2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 5.18 2 2 0 0 1 5.07 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.24a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function RubikaIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.38 8.38 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="13" height="13" x="9" y="9" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function SupportPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);

      setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch (error) {
      console.error("Copy error:", error);
    }
  }

  function goBack() {
    window.location.href = "/profile";
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 px-4 pb-32 pt-8 text-white"
    >
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="بازگشت"
          >
            <ArrowIcon />
          </button>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <SupportIcon />
          </div>

          <div>
            <h1 className="text-xl font-bold">پشتیبانی و آموزش</h1>
            <p className="mt-1 text-sm text-slate-400">
              راهنمای استفاده و ارتباط با پشتیبانی
            </p>
          </div>
        </header>

        {/* Intro */}
        <section className="mb-5 rounded-3xl border border-white/10 bg-slate-900 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <SupportIcon />
            </div>

            <div>
              <h2 className="font-bold">نیاز به کمک داری؟</h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-400">
                اگر درباره خرید، پرداخت، کیف پول یا استفاده از سایت سوالی
                داری، می‌توانی از راه‌های ارتباطی زیر با پشتیبانی در تماس باشی.
              </p>
            </div>
          </div>
        </section>

        {/* Phone numbers */}
        <section className="mb-5 rounded-3xl border border-white/10 bg-slate-900 p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <PhoneIcon />
            </div>

            <div>
              <h2 className="font-bold">شماره‌های پشتیبانی</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                برای تماس با پشتیبانی
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {phoneNumbers.map((phone) => (
              <div
                key={phone}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3"
              >
                <div
                  dir="ltr"
                  className="min-w-0 text-left text-base font-semibold tracking-wide text-slate-100"
                >
                  {phone}
                </div>

                <button
                  type="button"
                  onClick={() => copyText(phone)}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 px-3 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  {copied === phone ? (
                    <>
                      <CheckIcon />
                      کپی شد
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      کپی
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Rubika */}
        <section className="mb-7 rounded-3xl border border-white/10 bg-slate-900 p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <RubikaIcon />
            </div>

            <div>
              <h2 className="font-bold">آیدی‌های روبیکا</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                ارتباط با پشتیبانی در روبیکا
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {rubikaIds.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3"
              >
                <div
                  dir="ltr"
                  className="min-w-0 text-left text-base font-semibold tracking-wide text-slate-100"
                >
                  {id}
                </div>

                <button
                  type="button"
                  onClick={() => copyText(id)}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 px-3 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  {copied === id ? (
                    <>
                      <CheckIcon />
                      کپی شد
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      کپی
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold">سوالات متداول</h2>
            <p className="mt-1 text-sm text-slate-500">
              پاسخ سوالات رایج کاربران
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-right transition hover:bg-slate-800/70"
                  >
                    <span className="text-sm font-semibold text-slate-100">
                      {faq.question}
                    </span>

                    <ChevronIcon open={isOpen} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/10 px-4 pb-4 pt-3">
                      <p className="text-sm leading-7 text-slate-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom note */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-center text-xs leading-6 text-slate-500">
          هنگام تماس با پشتیبانی، در صورت نیاز اطلاعات مربوط به خرید یا
          تراکنش خود را اعلام کنید تا بررسی سریع‌تر انجام شود.
        </div>
      </div>

      {/* Copy notification */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-emerald-400/20 bg-slate-800 px-5 py-3 text-sm font-medium text-emerald-400 shadow-xl">
          با موفقیت کپی شد ✓
        </div>
      )}
    </main>
  );
}