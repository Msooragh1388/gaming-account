"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Purchase = {
  id: number;
  userId: number | null;
  productId: number | null;
  fullName: string | null;
  phoneNumber: string | null;
  price: number | null;
  accountUsername: string | null;
  accountPassword: string | null;
  status: string | null;
  createdAt: string | null;
};

function formatPrice(price: number | null) {
  if (price === null || price === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("fa-IR").format(price);
}

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export default function AdminBuyersPage() {
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadPurchases() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("Purchase")
      .select("*")
      .order("createdAt", {
        ascending: false,
      });

    if (error) {
      console.error(error);

      setMessage(
        `خطا در دریافت اطلاعات خریداران: ${error.message}`
      );

      setLoading(false);
      return;
    }

    setPurchases(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07070a] text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black">
              خریداران
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              اطلاعات کامل خریدها و خریداران
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadPurchases}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10"
            >
              ↻ بروزرسانی
            </button>

            <button
              onClick={() => router.push("/admin")}
              className="rounded-2xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200"
            >
              بازگشت به پنل
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-zinc-400">
              تعداد خریدها
            </div>

            <div className="mt-2 text-3xl font-black">
              {new Intl.NumberFormat("fa-IR").format(
                purchases.length
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-zinc-400">
              مجموع مبلغ خریدها
            </div>

            <div className="mt-2 text-3xl font-black">
              {new Intl.NumberFormat("fa-IR").format(
                purchases.reduce(
                  (total, purchase) =>
                    total + Number(purchase.price || 0),
                  0
                )
              )}
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            در حال دریافت اطلاعات خریداران...
          </div>
        ) : purchases.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            هنوز هیچ خریدی ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-5">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/[0.07]"
              >
                {/* Purchase header */}
                <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs text-zinc-500">
                      شناسه خرید
                    </div>

                    <div className="mt-1 text-xl font-black">
                      #{purchase.id}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/10 px-4 py-2 text-sm">
                    وضعیت:{" "}
                    <span className="font-bold text-white">
                      {purchase.status || "—"}
                    </span>
                  </div>
                </div>

                {/* Buyer information */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <InfoBox
                    title="نام و نام خانوادگی"
                    value={purchase.fullName}
                  />

                  <InfoBox
                    title="شماره موبایل"
                    value={purchase.phoneNumber}
                  />

                  <InfoBox
                    title="شناسه کاربر"
                    value={
                      purchase.userId !== null
                        ? String(purchase.userId)
                        : null
                    }
                  />

                  <InfoBox
                    title="شناسه محصول"
                    value={
                      purchase.productId !== null
                        ? String(purchase.productId)
                        : null
                    }
                  />

                  <InfoBox
                    title="مبلغ خرید"
                    value={
                      purchase.price !== null
                        ? `${formatPrice(
                            purchase.price
                          )} تومان`
                        : null
                    }
                  />

                  <InfoBox
                    title="نام کاربری اکانت"
                    value={purchase.accountUsername}
                  />

                  <InfoBox
                    title="رمز عبور اکانت"
                    value={purchase.accountPassword}
                  />

                  <InfoBox
                    title="وضعیت"
                    value={purchase.status}
                  />

                  <InfoBox
                    title="تاریخ خرید"
                    value={formatDate(
                      purchase.createdAt
                    )}
                  />

                  <InfoBox
                    title="createdAt"
                    value={purchase.createdAt}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function InfoBox({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 text-xs text-zinc-500">
        {title}
      </div>

      <div className="break-all font-bold text-zinc-100">
        {value || "—"}
      </div>
    </div>
  );
}