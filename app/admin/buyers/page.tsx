
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
  if (price === null || price === undefined) return "—";
  return new Intl.NumberFormat("fa-IR").format(price);
}

function formatDate(date: string | null) {
  if (!date) return "—";

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
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  // خریدی که پنجره حذف آن باز شده است
  const [purchaseToDelete, setPurchaseToDelete] =
    useState<Purchase | null>(null);

  // تیک داخل پنجره تأیید حذف
  const [deleteFromCustomer, setDeleteFromCustomer] = useState(false);

  async function loadPurchases() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.rpc("get_admin_purchases");

    if (error) {
      console.error("get_admin_purchases error:", error);
      setMessage(`خطا در دریافت اطلاعات: ${error.message}`);
      setMessageType("error");
      setLoading(false);
      return;
    }

    setPurchases((data || []) as Purchase[]);
    setLoading(false);
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  function openDeleteModal(purchase: Purchase) {
    setPurchaseToDelete(purchase);
    setDeleteFromCustomer(false);
    setMessage("");
  }

  function closeDeleteModal() {
    if (deleting) return;

    setPurchaseToDelete(null);
    setDeleteFromCustomer(false);
  }

  async function confirmDelete() {
    if (!purchaseToDelete || deleting) return;

    const purchaseId = purchaseToDelete.id;

    setDeleting(true);
    setMessage("");

    const { error } = await supabase.rpc("delete_admin_purchase", {
      p_purchase_id: purchaseId,
      p_delete_from_customer: deleteFromCustomer,
    });

    if (error) {
      console.error("delete_admin_purchase error:", error);
      setMessage(`خطا در حذف خرید: ${error.message}`);
      setMessageType("error");
      setDeleting(false);
      return;
    }

    setPurchases((previous) =>
      previous.filter((item) => item.id !== purchaseId)
    );

    setMessage(
      deleteFromCustomer
        ? `خرید شماره ${purchaseId} از پنل ادمین و خریدهای مشتری حذف شد.`
        : `خرید شماره ${purchaseId} از لیست ادمین حذف شد.`
    );

    setMessageType("success");
    setDeleting(false);
    setPurchaseToDelete(null);
    setDeleteFromCustomer(false);
  }

  const totalPrice = purchases.reduce(
    (total, purchase) => total + Number(purchase.price || 0),
    0
  );

  return (
    <main dir="rtl" className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black">خریداران</h1>
            <p className="mt-2 text-sm text-zinc-400">
              مدیریت خریدها و اطلاعات خریداران
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadPurchases}
              disabled={loading || deleting}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10 disabled:opacity-50"
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

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-zinc-400">تعداد خریدها</div>
            <div className="mt-2 text-3xl font-black">
              {new Intl.NumberFormat("fa-IR").format(purchases.length)}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-zinc-400">مجموع مبلغ خریدها</div>
            <div className="mt-2 text-3xl font-black">
              {new Intl.NumberFormat("fa-IR").format(totalPrice)}
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${
              messageType === "error"
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-green-500/20 bg-green-500/10 text-green-300"
            }`}
          >
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
                <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs text-zinc-500">شناسه خرید</div>
                    <div className="mt-1 text-xl font-black">
                      #{purchase.id}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-xl bg-white/10 px-4 py-2 text-sm">
                      وضعیت:{" "}
                      <span className="font-bold">
                        {purchase.status || "—"}
                      </span>
                    </div>

                    <button
                      onClick={() => openDeleteModal(purchase)}
                      disabled={deleting}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      حذف خرید
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <InfoBox title="نام و نام خانوادگی" value={purchase.fullName} />
                  <InfoBox title="شماره موبایل" value={purchase.phoneNumber} />

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
                        ? `${formatPrice(purchase.price)} تومان`
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

                  <InfoBox title="وضعیت" value={purchase.status} />

                  <InfoBox
                    title="تاریخ خرید"
                    value={formatDate(purchase.createdAt)}
                  />

                  <InfoBox title="createdAt" value={purchase.createdAt} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* پنجره تأیید حذف */}
      {purchaseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div
            dir="rtl"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#141419] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
                🗑️
              </div>

              <div>
                <h2 className="text-xl font-black">تأیید حذف خرید</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  خرید شماره #{purchaseToDelete.id}
                </p>
              </div>
            </div>

            <p className="mb-5 text-sm leading-7 text-zinc-300">
              آیا از حذف این خرید مطمئنی؟ ابتدا مشخص کن حذف از کجا انجام شود.
            </p>

            <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <input
                type="checkbox"
                checked={deleteFromCustomer}
                onChange={(event) =>
                  setDeleteFromCustomer(event.target.checked)
                }
                disabled={deleting}
                className="mt-1 h-5 w-5 shrink-0 accent-red-500"
              />

              <span>
                <span className="block font-bold text-white">
                  حذف از خریدهای مشتری هم انجام شود
                </span>

                <span className="mt-1 block text-xs leading-6 text-zinc-400">
                  با فعال کردن این گزینه، همین خرید از بخش خریدهای مشتری هم
                  حذف می‌شود. حساب کاربری مشتری حذف نخواهد شد.
                </span>
              </span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "در حال حذف..." : "تأیید حذف"}
              </button>

              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 rounded-xl border border-white/10 px-5 py-3 font-bold text-zinc-200 transition hover:bg-white/5 disabled:opacity-50"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
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
      <div className="mb-2 text-xs text-zinc-500">{title}</div>
      <div className="break-all font-bold text-zinc-100">{value || "—"}</div>
    </div>
  );
}