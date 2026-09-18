"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  game: string;
  title: string;
  description: string | null;
  price: number;
  images: string[] | null;
  videoUrl: string | null;
  isSold: boolean;
  likes: number;
  createdAt: string;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price);
}

export default function AdminAccountsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter =
    searchParams.get("filter") || "all";

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadProducts() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("ProductPublic")
      .select("*")
      .order("createdAt", {
        ascending: false,
      });

    if (error) {
      console.error(error);

      setMessage(
        `خطا در دریافت اکانت‌ها: ${error.message}`
      );

      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts =
    filter === "available"
      ? products.filter((product) => !product.isSold)
      : filter === "sold"
      ? products.filter((product) => product.isSold)
      : products;

  const pageTitle =
    filter === "available"
      ? "اکانت‌های موجود"
      : filter === "sold"
      ? "اکانت‌های فروخته‌شده"
      : "کل اکانت‌ها";

  async function toggleSold(product: Product) {
    setMessage("");

    const { data, error } =
      await supabase.rpc(
        "toggle_product_sold",
        {
          p_id: product.id,
        }
      );

    if (error) {
      console.error(error);

      setMessage(
        `خطا در تغییر وضعیت: ${error.message}`
      );

      return;
    }

    if (data !== true) {
      setMessage(
        "وضعیت اکانت تغییر نکرد."
      );

      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              isSold: !product.isSold,
            }
          : item
      )
    );

    setMessage(
      product.isSold
        ? "اکانت دوباره فعال شد."
        : "اکانت به حالت فروخته‌شده رفت."
    );
  }

  async function deleteProduct(
    product: Product
  ) {
    const confirmed = window.confirm(
      `آیا مطمئنی می‌خواهی اکانت «${product.title}» را حذف کنی؟`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    const { data, error } =
      await supabase.rpc(
        "delete_product_account",
        {
          p_id: product.id,
        }
      );

    if (error) {
      console.error(error);

      setMessage(
        `خطا در حذف اکانت: ${error.message}`
      );

      return;
    }

    if (data !== true) {
      setMessage(
        "اکانت حذف نشد؛ رکورد موردنظر پیدا نشد."
      );

      return;
    }

    setProducts((current) =>
      current.filter(
        (item) => item.id !== product.id
      )
    );

    setMessage(
      "اکانت با موفقیت حذف شد."
    );
  }

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
              {pageTitle}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              مدیریت اکانت‌های بازی
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            {/* ADD ACCOUNT */}

            <button
              type="button"
              onClick={() =>
                router.push("/admin?add=true")
              }
              className="rounded-2xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200"
            >
              + افزودن اکانت
            </button>

            {/* BACK */}

            <button
              type="button"
              onClick={() =>
                router.push("/admin")
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10"
            >
              ← پنل مدیریت
            </button>
          </div>
        </div>

        {/* FILTER BUTTONS */}

        <div className="mb-8 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/accounts?filter=all"
              )
            }
            className={`rounded-2xl border border-white/10 p-4 text-sm font-bold transition ${
              filter === "all"
                ? "bg-white text-black"
                : "bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            همه اکانت‌ها
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/accounts?filter=available"
              )
            }
            className={`rounded-2xl border border-white/10 p-4 text-sm font-bold transition ${
              filter === "available"
                ? "bg-white text-black"
                : "bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            موجود
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/accounts?filter=sold"
              )
            }
            className={`rounded-2xl border border-white/10 p-4 text-sm font-bold transition ${
              filter === "sold"
                ? "bg-white text-black"
                : "bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            فروخته‌شده
          </button>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm">
            {message}
          </div>
        )}

        {/* ACCOUNT LIST */}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">
              {pageTitle}
            </h2>

            <button
              type="button"
              onClick={loadProducts}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              ↻ بروزرسانی
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
              در حال دریافت اکانت‌ها...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-zinc-400">
              در این بخش اکانتی وجود ندارد.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map(
                (product) => (
                  <div
                    key={product.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                      {/* PRODUCT INFO */}

                      <div className="flex min-w-0 gap-4">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-24 w-24 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                            🎮
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap gap-2">
                            <span className="rounded-lg bg-white/10 px-2 py-1 text-xs text-zinc-300">
                              {product.game}
                            </span>

                            {product.isSold ? (
                              <span className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-400">
                                فروخته شد
                              </span>
                            ) : (
                              <span className="rounded-lg bg-green-500/10 px-2 py-1 text-xs text-green-400">
                                موجود
                              </span>
                            )}
                          </div>

                          <h3 className="truncate text-lg font-bold">
                            {product.title}
                          </h3>

                          <p className="mt-2 text-sm text-zinc-400">
                            {formatPrice(
                              product.price
                            )}{" "}
                            تومان
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            ❤️ {product.likes}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin?edit=${product.id}`
                            )
                          }
                          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/10"
                        >
                          ویرایش
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleSold(product)
                          }
                          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/10"
                        >
                          {product.isSold
                            ? "فعال کردن"
                            : "فروخته شد"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteProduct(
                              product
                            )
                          }
                          className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}