"use client";

import { useEffect, useState } from "react";
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
updatedAt: string;
};

function BookmarkIcon({ saved = false }: { saved?: boolean }) {
return (
<svg
viewBox="0 0 24 24"
fill={saved ? "currentColor" : "none"}
className="h-5 w-5"
xmlns="http://www.w3.org/2000/svg"
> <path
     d="M6 4.75C6 3.7835 6.7835 3 7.75 3H16.25C17.2165 3 18 3.7835 18 4.75V21L12 17.5L6 21V4.75Z"
     stroke="currentColor"
     strokeWidth="1.7"
     strokeLinejoin="round"
   /> </svg>
);
}

function HeartIcon({ liked = false }: { liked?: boolean }) {
return (
<svg
viewBox="0 0 24 24"
fill={liked ? "currentColor" : "none"}
className="h-5 w-5"
xmlns="http://www.w3.org/2000/svg"
> <path
     d="M20.84 8.61C20.84 13.23 12 19 12 19S3.16 13.23 3.16 8.61C3.16 5.89 5.2 4 7.72 4C9.2 4 10.57 4.71 11.4 5.82L12 6.62L12.6 5.82C13.43 4.71 14.8 4 16.28 4C18.8 4 20.84 5.89 20.84 8.61Z"
     stroke="currentColor"
     strokeWidth="1.7"
     strokeLinecap="round"
     strokeLinejoin="round"
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

export default function SavedAccountsPage() {
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [message, setMessage] = useState("");

const [selectedProduct, setSelectedProduct] =
useState<Product | null>(null);

const [selectedImage, setSelectedImage] = useState(0);

const [cartIds, setCartIds] = useState<number[]>([]);

const [liked, setLiked] = useState<number[]>([]);
const [liking, setLiking] = useState<number[]>([]);

useEffect(() => {
void loadSavedProducts();
loadCart();
void loadUserLikes();

function handleCartUpdated() {
  loadCart();
}

window.addEventListener(
  "gaming-cart-updated",
  handleCartUpdated
);

return () => {
  window.removeEventListener(
    "gaming-cart-updated",
    handleCartUpdated
  );
};


}, []);

useEffect(() => {
if (!message) return;


const timer = window.setTimeout(() => {
  setMessage("");
}, 2500);

return () => {
  window.clearTimeout(timer);
};


}, [message]);

async function loadUserLikes() {
try {
const token = localStorage.getItem(
"gaming_account_token"
);


  const user = localStorage.getItem(
    "gaming_account_user"
  );

  if (!token || !user) {
    setLiked([]);
    return;
  }

  const response = await fetch("/api/likes/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.loggedIn === false) {
    setLiked([]);
    return;
  }

  if (Array.isArray(data.liked)) {
    const ids = data.liked
      .map((id: unknown) => Number(id))
      .filter(
        (id: number) =>
          Number.isInteger(id) && id > 0
      );

    setLiked(ids);
  }
} catch (err) {
  console.error("Load user likes error:", err);
}


}

async function toggleLike(productId: number) {
const token = localStorage.getItem(
"gaming_account_token"
);


const user = localStorage.getItem(
  "gaming_account_user"
);

if (!token || !user) {
  setMessage(
    "برای لایک کردن ابتدا وارد حساب کاربری شوید."
  );

  window.location.href = "/profile";
  return;
}

if (liking.includes(productId)) {
  return;
}

setLiking((current) => [
  ...current,
  productId,
]);

try {
  const response = await fetch("/api/likes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      productId,
    }),
  });

  const data = await response.json();

  if (
    response.status === 401 ||
    data.loggedIn === false
  ) {
    setLiked((current) =>
      current.filter(
        (id) => id !== productId
      )
    );

    setMessage(
      "نشست کاربر منقضی شده است."
    );

    return;
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        "تغییر وضعیت لایک ناموفق بود."
    );
  }

  const isLiked = Boolean(data.liked);

  const likesCount =
    typeof data.likes === "number"
      ? data.likes
      : undefined;

  setLiked((current) => {
    if (isLiked) {
      return current.includes(productId)
        ? current
        : [...current, productId];
    }

    return current.filter(
      (id) => id !== productId
    );
  });

  if (typeof likesCount === "number") {
    setProducts((current) =>
      current.map((product) =>
        Number(product.id) ===
        Number(productId)
          ? {
              ...product,
              likes: likesCount,
            }
          : product
      )
    );

    setSelectedProduct((current) => {
      if (
        !current ||
        Number(current.id) !==
          Number(productId)
      ) {
        return current;
      }

      return {
        ...current,
        likes: likesCount,
      };
    });
  }

  setMessage(
    isLiked
      ? "اکانت لایک شد ❤️"
      : "لایک اکانت حذف شد"
  );
} catch (err) {
  console.error(
    "Toggle like error:",
    err
  );

  setMessage(
    err instanceof Error
      ? err.message
      : "تغییر لایک ناموفق بود."
  );
} finally {
  setLiking((current) =>
    current.filter(
      (id) => id !== productId
    )
  );
}


}

function toggleSave(productId: number) {
try {
const savedRaw = localStorage.getItem(
"gaming_account_saved"
);


  let savedIds: number[] = [];

  if (savedRaw) {
    try {
      const parsed = JSON.parse(
        savedRaw
      );

      if (Array.isArray(parsed)) {
        savedIds = parsed
          .map((id) => Number(id))
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0
          );
      }
    } catch {
      savedIds = [];
    }
  }

  const isAlreadySaved =
    savedIds.includes(Number(productId));

  const newIds = isAlreadySaved
    ? savedIds.filter(
        (id) =>
          id !== Number(productId)
      )
    : [
        ...savedIds,
        Number(productId),
      ];

  localStorage.setItem(
    "gaming_account_saved",
    JSON.stringify(newIds)
  );

  if (isAlreadySaved) {
    setProducts((current) =>
      current.filter(
        (product) =>
          Number(product.id) !==
          Number(productId)
      )
    );

    setSelectedProduct(null);
    setSelectedImage(0);

    setMessage(
      "اکانت از ذخیره‌شده‌ها حذف شد."
    );
  } else {
    setMessage("اکانت ذخیره شد 🔖");
  }
} catch (err) {
  console.error(
    "Toggle save error:",
    err
  );

  setError(
    "تغییر وضعیت ذخیره اکانت ناموفق بود."
  );
}


}

function loadCart() {
try {
const raw = localStorage.getItem(
"gaming_account_cart"
);


  if (!raw) {
    setCartIds([]);
    return;
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    setCartIds([]);
    return;
  }

  const ids = parsed
    .map((id) => Number(id))
    .filter(
      (id) =>
        Number.isInteger(id) && id > 0
    );

  setCartIds(ids);
} catch (err) {
  console.error(
    "Load cart error:",
    err
  );

  setCartIds([]);
}


}

function isInCart(productId: number) {
return cartIds.includes(
Number(productId)
);
}

async function loadSavedProducts() {
setLoading(true);
setError("");


try {
  const savedRaw = localStorage.getItem(
    "gaming_account_saved"
  );

  if (!savedRaw) {
    setProducts([]);
    return;
  }

  let savedIds: number[] = [];

  try {
    const parsed = JSON.parse(
      savedRaw
    );

    if (Array.isArray(parsed)) {
      savedIds = parsed
        .map((id) => Number(id))
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        );
    }
  } catch {
    savedIds = [];
  }

  if (savedIds.length === 0) {
    setProducts([]);
    return;
  }

  const { data, error } = await supabase
    .from("ProductPublic")
    .select(
      "id, game, title, description, price, images, videoUrl, isSold, likes, createdAt, updatedAt"
    )
    .in("id", savedIds);

  if (error) {
    console.error(
      "Saved products error:",
      error
    );

    throw new Error(
      "دریافت اکانت‌های ذخیره‌شده ناموفق بود."
    );
  }

  const loadedProducts =
    (data || []) as Product[];

  const sortedProducts = savedIds
    .map((id) =>
      loadedProducts.find(
        (product) =>
          Number(product.id) === id
      )
    )
    .filter(
      (
        product
      ): product is Product =>
        Boolean(product)
    );

  const existingIds =
    loadedProducts.map(
      (product) =>
        Number(product.id)
    );

  const cleanedIds =
    savedIds.filter((id) =>
      existingIds.includes(id)
    );

  if (
    cleanedIds.length !==
    savedIds.length
  ) {
    localStorage.setItem(
      "gaming_account_saved",
      JSON.stringify(cleanedIds)
    );
  }

  setProducts(sortedProducts);
} catch (err) {
  console.error(
    "Load saved products error:",
    err
  );

  setError(
    err instanceof Error
      ? err.message
      : "خطایی در دریافت اکانت‌های ذخیره‌شده رخ داد."
  );
} finally {
  setLoading(false);
}


}

function removeSaved(productId: number) {
try {
const savedRaw = localStorage.getItem(
"gaming_account_saved"
);


  let savedIds: number[] = [];

  if (savedRaw) {
    try {
      const parsed = JSON.parse(
        savedRaw
      );

      if (Array.isArray(parsed)) {
        savedIds = parsed
          .map((id) => Number(id))
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0
          );
      }
    } catch {
      savedIds = [];
    }
  }

  const newIds = savedIds.filter(
    (id) =>
      id !== Number(productId)
  );

  localStorage.setItem(
    "gaming_account_saved",
    JSON.stringify(newIds)
  );

  setProducts((current) =>
    current.filter(
      (product) =>
        Number(product.id) !==
        Number(productId)
    )
  );

  if (
    selectedProduct &&
    Number(selectedProduct.id) ===
      Number(productId)
  ) {
    setSelectedProduct(null);
    setSelectedImage(0);
  }

  setMessage(
    "اکانت از ذخیره‌شده‌ها حذف شد."
  );
} catch (err) {
  console.error(
    "Remove saved error:",
    err
  );

  setError(
    "حذف اکانت ذخیره‌شده ناموفق بود."
  );
}


}

function openProduct(product: Product) {
setSelectedProduct(product);
setSelectedImage(0);
}

function closeProduct() {
setSelectedProduct(null);
setSelectedImage(0);
}

function goBack() {
window.location.href = "/profile";
}

function goToStore() {
window.location.href = "/";
}

function addToCart(product: Product) {
if (product.isSold) {
setMessage(
"این اکانت فروخته شده است."
);
return;
}


try {
  const raw = localStorage.getItem(
    "gaming_account_cart"
  );

  let currentCart: number[] = [];

  if (raw) {
    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        currentCart = parsed
          .map((id) => Number(id))
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0
          );
      }
    } catch {
      currentCart = [];
    }
  }

  const productId = Number(product.id);

  if (currentCart.includes(productId)) {
    setCartIds(currentCart);

    setMessage(
      "این اکانت قبلاً در سبد خرید است."
    );

    return;
  }

  const newCart = [
    ...currentCart,
    productId,
  ];

  localStorage.setItem(
    "gaming_account_cart",
    JSON.stringify(newCart)
  );

  setCartIds(newCart);

  window.dispatchEvent(
    new Event("gaming-cart-updated")
  );

  setMessage(
    "اکانت با موفقیت به سبد خرید اضافه شد."
  );
} catch (err) {
  console.error(
    "Add to cart error:",
    err
  );

  setMessage(
    "افزودن به سبد خرید ناموفق بود."
  );
}


}

function formatPrice(price: number) {
return new Intl.NumberFormat(
"fa-IR"
).format(price);
}

if (loading) {
return ( <main
     dir="rtl"
     className="min-h-screen bg-slate-950 px-4 py-10 text-white"
   > <div className="mx-auto max-w-2xl"> <div className="flex min-h-[60vh] items-center justify-center"> <div className="text-center"> <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-white" />


          <p className="mt-4 text-xs text-slate-500">
            در حال دریافت اکانت‌های ذخیره‌شده...
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
            <BookmarkIcon />
          </div>
        </div>

        <h1 className="mt-3 text-lg font-bold">
          اکانت‌های ذخیره‌شده
        </h1>

        <p className="mt-1 text-[11px] text-slate-600">
          اکانت‌هایی که برای بعد ذخیره کرده‌ای
        </p>
      </div>

      <div className="w-9" />
    </div>

    {/* Error */}
    {error && (
      <div className="mb-4 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-center text-xs text-red-300">
        {error}
      </div>
    )}

    {/* Empty */}
    {products.length === 0 ? (
      <section className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-7 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-slate-500">
          <BookmarkIcon />
        </div>

        <h2 className="mt-4 text-sm font-bold">
          هنوز اکانتی ذخیره نکرده‌ای
        </h2>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          وقتی یک اکانت را ذخیره کنی،
          از اینجا می‌توانی دوباره آن را ببینی.
        </p>

        <button
          type="button"
          onClick={goToStore}
          className="mt-5 w-full rounded-xl bg-white py-3 text-xs font-bold text-slate-950 transition hover:bg-slate-200 active:scale-[0.99]"
        >
          رفتن به فروشگاه
        </button>
      </section>
    ) : (
      <>
        {/* Count */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            {products.length.toLocaleString(
              "fa-IR"
            )}{" "}
            اکانت ذخیره‌شده
          </p>
        </div>

        {/* Products */}
        <div className="space-y-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/70 shadow-lg"
            >
              <div className="flex gap-3 p-3">

                {/* Image */}
                <button
                  type="button"
                  onClick={() =>
                    openProduct(product)
                  }
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-800/70"
                >
                  {product.images &&
                  product.images.length >
                    0 ? (
                    <img
                      src={
                        product.images[0]
                      }
                      alt={product.title}
                      className="h-full w-full object-cover transition hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-600">
                      بدون تصویر
                    </div>
                  )}
                </button>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openProduct(product)
                      }
                      className="min-w-0 text-right"
                    >
                      <h2 className="line-clamp-2 text-sm font-bold leading-5 transition hover:text-slate-300">
                        {product.title}
                      </h2>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeSaved(
                          product.id
                        )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/[0.06] text-red-400/70 transition hover:bg-red-500/10 hover:text-red-300"
                      aria-label="حذف از ذخیره‌شده‌ها"
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-600">
                    {product.game}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-300">
                      {formatPrice(
                        product.price
                      )}{" "}
                      تومان
                    </p>

                    {product.isSold ? (
                      <button
                        type="button"
                        onClick={() =>
                          openProduct(product)
                        }
                        className="rounded-lg bg-red-500/[0.06] px-2.5 py-1.5 text-[10px] font-bold text-red-300/80"
                      >
                        فروخته شده
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          openProduct(product)
                        }
                        className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
                      >
                        مشاهده
                        <ArrowIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </>
    )}

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
      <div className="fixed bottom-6 left-1/2 z-[600] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-xs font-medium text-white shadow-2xl backdrop-blur">
        {message}
      </div>
    )}
  </div>

  {/* Product Modal */}
  {selectedProduct && (
    <div
      className="fixed inset-0 z-[500] overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onClick={closeProduct}
    >
      <div className="flex min-h-full items-center justify-center py-8">
        <div
          onClick={(event) =>
            event.stopPropagation()
          }
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
        >

          {/* Close */}
          <button
            type="button"
            onClick={closeProduct}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-lg backdrop-blur transition hover:bg-black/80"
            aria-label="بستن"
          >
            ✕
          </button>

          {/* Image / Video */}
          <div className="relative aspect-square w-full bg-black sm:aspect-video">
            {selectedImage === -1 &&
            selectedProduct.videoUrl ? (
              <video
                src={selectedProduct.videoUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src={
                  selectedProduct.images?.[
                    selectedImage
                  ] ||
                  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80"
                }
                alt={selectedProduct.title}
                className="h-full w-full object-contain"
              />
            )}

            {selectedProduct.isSold && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-2xl bg-red-500/20 px-6 py-3 text-lg font-black text-red-300">
                  فروخته شد
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {((selectedProduct.images &&
            selectedProduct.images.length > 1) ||
            selectedProduct.videoUrl) && (
            <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-black/20 p-3">
              {selectedProduct.images?.map(
                (image, index) => (
                  <button
                    type="button"
                    key={
                      image + index
                    }
                    onClick={() =>
                      setSelectedImage(
                        index
                      )
                    }
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                      selectedImage === index
                        ? "border-white"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                )
              )}

              {selectedProduct.videoUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage(-1)
                  }
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 bg-white/5 text-2xl ${
                    selectedImage === -1
                      ? "border-white"
                      : "border-white/10"
                  }`}
                >
                  🎬
                </button>
              )}
            </div>
          )}

          {/* Details */}
          <div className="p-5 sm:p-7">

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-xl bg-indigo-500/15 px-3 py-1 text-xs text-indigo-300">
                  {selectedProduct.game}
                </span>

                <div className="mt-3 flex items-start gap-2">
                  <h2 className="min-w-0 flex-1 text-xl font-black leading-8 sm:text-2xl">
                    {selectedProduct.title}
                  </h2>

                  {/* Like */}
                  <button
                    type="button"
                    disabled={liking.includes(
                      selectedProduct.id
                    )}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      void toggleLike(
                        selectedProduct.id
                      );
                    }}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                      liked.includes(
                        selectedProduct.id
                      )
                        ? "border-red-400/20 bg-red-500/10 text-red-400"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-red-400"
                    } ${
                      liking.includes(
                        selectedProduct.id
                      )
                        ? "cursor-wait opacity-60"
                        : ""
                    }`}
                    aria-label={
                      liked.includes(
                        selectedProduct.id
                      )
                        ? "حذف لایک"
                        : "پسندیدن"
                    }
                    aria-pressed={liked.includes(
                      selectedProduct.id
                    )}
                  >
                    <HeartIcon
                      liked={liked.includes(
                        selectedProduct.id
                      )}
                    />
                  </button>

                  {/* Save */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      toggleSave(
                        selectedProduct.id
                      );
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
                    aria-label="حذف از ذخیره‌شده‌ها"
                  >
                    <BookmarkIcon saved />
                  </button>
                </div>
              </div>
            </div>

            {/* Like Count */}
            <div className="mt-3 text-xs text-slate-500">
              ❤️{" "}
              {selectedProduct.likes}{" "}
              پسند
            </div>

            {/* Description */}
            {selectedProduct.description && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-bold">
                  توضیحات اکانت
                </h3>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                  {
                    selectedProduct.description
                  }
                </div>
              </div>
            )}

            {/* Security */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-500/5 p-4">
              <span className="text-xl">
                🔐
              </span>

              <div>
                <p className="text-sm font-bold">
                  اطلاعات ورود محفوظ است
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  اطلاعات ورود اکانت پس از خرید در اختیار خریدار قرار می‌گیرد.
                </p>
              </div>
            </div>

            {/* Price + Cart */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  قیمت
                </p>

                <p className="mt-1 text-2xl font-black">
                  {formatPrice(
                    selectedProduct.price
                  )}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    تومان
                  </span>
                </p>
              </div>

              <button
                type="button"
                disabled={
                  selectedProduct.isSold
                }
                onClick={() =>
                  addToCart(
                    selectedProduct
                  )
                }
                className={`rounded-2xl px-6 py-3.5 text-sm font-bold transition ${
                  selectedProduct.isSold
                    ? "cursor-not-allowed bg-white/5 text-slate-600"
                    : isInCart(
                        selectedProduct.id
                      )
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-white text-slate-950 hover:bg-slate-200"
                }`}
              >
                {selectedProduct.isSold
                  ? "این اکانت فروخته شده"
                  : isInCart(
                      selectedProduct.id
                    )
                  ? "✓ در سبد خرید"
                  : "افزودن به سبد خرید"}
              </button>
            </div>

            {/* Remove from saved */}
            <button
              type="button"
              onClick={() =>
                removeSaved(
                  selectedProduct.id
                )
              }
              className="mt-3 w-full rounded-2xl border border-red-500/10 bg-red-500/[0.04] py-3 text-xs font-medium text-red-300/80 transition hover:bg-red-500/[0.08]"
            >
              حذف از اکانت‌های ذخیره‌شده
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</main>

);
}
