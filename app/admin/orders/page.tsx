"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  createdAt: string;
  status: string | null;
  accountPassword: string | null;
  accountUsername: string | null;
  price: number | null;
  phoneNumber: string | null;
  fullName: string | null;
  productId: number | null;
  userId: number | null;
};

function formatPrice(price: number | null) {
  if (price === null) {
    return "-";
  }

  return new Intl.NumberFormat("fa-IR").format(price);
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadOrders() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("Order")
      .select(
        "id, createdAt, status, accountPassword, accountUsername, price, phoneNumber, fullName, productId, userId"
      )
      .order("createdAt", {
        ascending: false,
      });

    if (error) {
      console.error(error);

      setMessage(
        `خطا در دریافت سفارش‌ها: ${error.message}`
      );

      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07070a] text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black">
              خریداران و سفارش‌ها
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              اطلاعات کامل سفارش‌های ثبت‌شده
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/admin")
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10"
            >
              ← پنل مدیریت
            </button>

            <button
              type="button"
              onClick={loadOrders}
              className="rounded-2xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200"
            >
              ↻ بروزرسانی
            </button>
          </div>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm">
            {message}
          </div>
        )}

        {/* COUNT */}

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">
            تعداد سفارش‌ها
          </p>

          <p className="mt-2 text-3xl font-black">
            {orders.length}
          </p>
        </div>

        {/* ORDERS */}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            در حال دریافت سفارش‌ها...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            هنوز سفارشی ثبت نشده است.
          </div>
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                {/* ORDER HEADER */}

                <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-black">
                      سفارش #{order.id}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-xl px-3 py-2 text-sm font-bold ${
                      order.status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : order.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : order.status === "cancelled"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {order.status || "بدون وضعیت"}
                  </span>
                </div>

                {/* BUYER */}

                <div className="mb-5">
                  <h3 className="mb-3 text-lg font-black">
                    👤 اطلاعات خریدار
                  </h3>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Info
                      label="نام و نام خانوادگی"
                      value={order.fullName}
                    />

                    <Info
                      label="شماره موبایل"
                      value={order.phoneNumber}
                    />

                    <Info
                      label="شناسه کاربر"
                      value={
                        order.userId !== null
                          ? String(order.userId)
                          : null
                      }
                    />
                  </div>
                </div>

                {/* ACCOUNT */}

                <div className="mb-5">
                  <h3 className="mb-3 text-lg font-black">
                    🎮 اطلاعات اکانت
                  </h3>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Info
                      label="نام کاربری اکانت"
                      value={
                        order.accountUsername
                      }
                    />

                    <Info
                      label="رمز اکانت"
                      value={
                        order.accountPassword
                      }
                    />

                    <Info
                      label="شناسه محصول"
                      value={
                        order.productId !== null
                          ? String(order.productId)
                          : null
                      }
                    />

                    <Info
                      label="قیمت"
                      value={
                        order.price !== null
                          ? `${formatPrice(
                              order.price
                            )} تومان`
                          : null
                      }
                    />
                  </div>
                </div>

                {/* RAW ORDER INFO */}

                <div>
                  <h3 className="mb-3 text-lg font-black">
                    📋 اطلاعات سفارش
                  </h3>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Info
                      label="شناسه سفارش"
                      value={String(order.id)}
                    />

                    <Info
                      label="وضعیت"
                      value={
                        order.status ||
                        "بدون وضعیت"
                      }
                    />

                    <Info
                      label="تاریخ ثبت"
                      value={formatDate(
                        order.createdAt
                      )}
                    />

                    <Info
                      label="شناسه کاربر"
                      value={
                        order.userId !== null
                          ? String(order.userId)
                          : null
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101014] p-4">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-bold text-zinc-200">
        {value || "-"}
      </p>
    </div>
  );
}