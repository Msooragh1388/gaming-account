
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  title: string;
  gameId: number | null;
  price: number | null;
  sold: boolean;
  createdAt: string | null;
  images: string[] | null;
  videoUrl: string | null;
};

function AccountsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter = searchParams.get("filter") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadProducts() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("ProductPublic")
      .select("*")
      .order("id", { ascending: false });

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

  const filteredProducts = products.filter((product) => {
    if (filter === "available") {
      return !product.sold;
    }

    if (filter === "sold") {
      return product.sold;
    }

    return true;
  });

  const title =
    filter === "available"
      ? "اکانت‌های موجود"
      : filter === "sold"
        ? "اکانت‌های فروخته‌شده"
        : "کل اکانت‌ها";

  async function toggleSold(
    product: Product
  ) {
    const { error } = await supabase
      .from("Product")
      .update({
        sold: !product.sold,
      })
      .eq("id", product.id);

    if (error) {
      console.error(error);

      setMessage(
        `خطا در تغییر وضعیت اکانت: ${error.message}`
      );

      return;
    }

    await loadProducts();
  }

  async function deleteProduct(
    productId: number
  ) {
    const confirmed = window.confirm(
      "آیا از حذف این اکانت مطمئن هستید؟"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("Product")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error(error);

      setMessage(
        `خطا در حذف اکانت: ${error.message}`
      );

      return;
    }

    await loadProducts();
  }

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
              {title}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              مدیریت و مشاهده اکانت‌ها
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-2xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200"
          >
            بازگشت به پنل
          </button>
        </div>

        {/* Filter buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() =>
              router.push(
                "/admin/accounts?filter=all"
              )
            }
            className={`rounded-2xl px-5 py-3 font-bold transition ${
              filter === "all"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            همه
          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/accounts?filter=available"
              )
            }
            className={`rounded-2xl px-5 py-3 font-bold transition ${
              filter === "available"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            موجود
          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/accounts?filter=sold"
              )
            }
            className={`rounded-2xl px-5 py-3 font-bold transition ${
              filter === "sold"
                ? "bg-white text-black"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            فروخته‌شده
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            در حال دریافت اکانت‌ها...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            اکانتی در این بخش وجود ندارد.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                {/* Image */}
                <div className="aspect-video bg-black">
                  {product.images &&
                  product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                      بدون تصویر
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="text-xl font-black">
                      {product.title}
                    </h2>

                    <span
                      className={`rounded-xl px-3 py-1 text-xs font-bold ${
                        product.sold
                          ? "bg-red-500/10 text-red-300"
                          : "bg-green-500/10 text-green-300"
                      }`}
                    >
                      {product.sold
                        ? "فروخته شده"
                        : "موجود"}
                    </span>
                  </div>

                  <div className="mb-5 text-lg font-bold">
                    {product.price !== null
                      ? `${new Intl.NumberFormat(
                          "fa-IR"
                        ).format(product.price)} تومان`
                      : "قیمت نامشخص"}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin?edit=${product.id}`
                        )
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold transition hover:bg-white/10"
                    >
                      ویرایش
                    </button>

                    <button
                      onClick={() =>
                        toggleSold(product)
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold transition hover:bg-white/10"
                    >
                      {product.sold
                        ? "علامت‌گذاری به‌عنوان موجود"
                        : "علامت‌گذاری به‌عنوان فروخته‌شده"}
                    </button>

                    <button
                      onClick={() =>
                        deleteProduct(product.id)
                      }
                      className="rounded-2xl bg-red-500/10 px-4 py-3 font-bold text-red-300 transition hover:bg-red-500/20"
                    >
                      حذف اکانت
                    </button>
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

export default function AdminAccountsPage() {
  return (
    <Suspense
      fallback={
        <main
          dir="rtl"
          className="min-h-screen bg-[#07070a] text-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-10 text-center text-zinc-400">
            در حال بارگذاری...
          </div>
        </main>
      }
    >
      <AccountsPageContent />
    </Suspense>
  );
}