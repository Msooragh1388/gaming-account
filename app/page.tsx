"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Game = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
};

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

type PurchasedAccount = {
  purchaseId: number;
  productId: number;
  productTitle: string;
  game: string;
  accountUsername: string;
  accountPassword: string;
  price: number;
};

function BookmarkIcon({ saved }: { saved: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={saved ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 transition-transform duration-200 ${
        saved ? "scale-110" : "scale-100"
      }`}
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

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
    >
      {open ? (
        <>
          <path
            d="M2.5 12C4.6 7.8 7.8 5.7 12 5.7C16.2 5.7 19.4 7.8 21.5 12C19.4 16.2 16.2 18.3 12 18.3C7.8 18.3 4.6 16.2 2.5 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
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
            d="M10.6 5.9C11.05 5.82 11.52 5.78 12 5.78C16.2 5.78 19.4 7.88 21.5 12C20.72 13.53 19.8 14.78 18.72 15.77"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M7.72 7.3C5.55 8.23 3.82 9.82 2.5 12C4.6 16.12 7.8 18.22 12 18.22C13.05 18.22 14.03 18.08 14.95 17.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [activeCategory, setActiveCategory] =
    useState("همه بازی‌ها");

  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [cart, setCart] = useState<number[]>([]);

  const [message, setMessage] = useState("");

  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);

  const [cartOpen, setCartOpen] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [purchaseComplete, setPurchaseComplete] =
    useState(false);

  const [purchasedAccounts, setPurchasedAccounts] =
    useState<PurchasedAccount[]>([]);

  const [visiblePasswords, setVisiblePasswords] =
    useState<number[]>([]);

  async function loadGames() {
    setLoadingGames(true);

    const { data, error } = await supabase
      .from("Game")
      .select("*")
      .eq("active", true)
      .order("createdAt", {
        ascending: true,
      });

    if (error) {
      console.error(error);

      setMessage(
        `خطا در دریافت بازی‌ها: ${error.message}`
      );

      setLoadingGames(false);
      return;
    }

    setGames(data || []);
    setLoadingGames(false);
  }

  async function loadProducts() {
    setLoadingProducts(true);

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

      setLoadingProducts(false);
      return;
    }

    setProducts(data || []);
    setLoadingProducts(false);
  }

  useEffect(() => {
    loadGames();
    loadProducts();

    const savedLikes = localStorage.getItem(
      "gaming_account_liked"
    );

    if (savedLikes) {
      try {
        const parsedLikes = JSON.parse(savedLikes);

        if (Array.isArray(parsedLikes)) {
          setLiked(
            parsedLikes.map((id) => Number(id))
          );
        }
      } catch {
        localStorage.removeItem(
          "gaming_account_liked"
        );
      }
    }

    const savedProducts = localStorage.getItem(
      "gaming_account_saved"
    );

    if (savedProducts) {
      try {
        const parsedSaved = JSON.parse(savedProducts);

        if (Array.isArray(parsedSaved)) {
          setSaved(
            parsedSaved.map((id) => Number(id))
          );
        }
      } catch {
        localStorage.removeItem(
          "gaming_account_saved"
        );
      }
    }

    const savedCart = localStorage.getItem(
      "gaming_account_cart"
    );

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(
            parsedCart.map((id) => Number(id))
          );
        }
      } catch {
        localStorage.removeItem(
          "gaming_account_cart"
        );
      }
    }

    const params = new URLSearchParams(
      window.location.search
    );

    if (params.get("cart") === "open") {
      setCartOpen(true);

      window.history.replaceState(
        {},
        "",
        window.location.pathname
      );
    }
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => {
      setMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [message]);

  const normalizedSearch =
    searchText.trim().toLowerCase();

  const filteredProducts = products.filter(
    (product) => {
      const matchesCategory =
        activeCategory === "همه بازی‌ها" ||
        product.game === activeCategory;

      const matchesSearch =
        normalizedSearch === "" ||
        product.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.game
          .toLowerCase()
          .includes(normalizedSearch) ||
        (product.description || "")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    }
  );

  const cartProducts = products.filter(
    (product) =>
      cart.includes(product.id) &&
      !product.isSold
  );

  const cartTotal = cartProducts.reduce(
    (total, product) =>
      total + Number(product.price),
    0
  );

  function toggleLike(id: number) {
    setLiked((current) => {
      const isAlreadyLiked = current.includes(id);

      const newLiked = isAlreadyLiked
        ? current.filter((item) => item !== id)
        : [...current, id];

      localStorage.setItem(
        "gaming_account_liked",
        JSON.stringify(newLiked)
      );

      return newLiked;
    });
  }

  function toggleSave(id: number) {
    setSaved((current) => {
      const isAlreadySaved = current.includes(id);

      const newSaved = isAlreadySaved
        ? current.filter((item) => item !== id)
        : [...current, id];

      localStorage.setItem(
        "gaming_account_saved",
        JSON.stringify(newSaved)
      );

      setMessage(
        isAlreadySaved
          ? "اکانت از ذخیره‌ها حذف شد"
          : "اکانت ذخیره شد"
      );

      return newSaved;
    });
  }

  function addToCart(id: number) {
    const product = products.find(
      (item) => item.id === id
    );

    if (!product) {
      return;
    }

    if (product.isSold) {
      setMessage("این اکانت فروخته شده است");
      return;
    }

    if (cart.includes(id)) {
      setMessage(
        "این اکانت قبلاً در سبد خرید است"
      );
      return;
    }

    setCart((current) => {
      const newCart = [...current, id];

      localStorage.setItem(
        "gaming_account_cart",
        JSON.stringify(newCart)
      );

      window.dispatchEvent(
        new Event("gaming-cart-updated")
      );

      return newCart;
    });

    setMessage(
      "اکانت به سبد خرید اضافه شد"
    );
  }

  function removeFromCart(id: number) {
    setCart((current) => {
      const newCart = current.filter(
        (item) => item !== id
      );

      localStorage.setItem(
        "gaming_account_cart",
        JSON.stringify(newCart)
      );

      window.dispatchEvent(
        new Event("gaming-cart-updated")
      );

      return newCart;
    });

    setMessage(
      "اکانت از سبد خرید حذف شد"
    );
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat(
      "fa-IR"
    ).format(price);
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedImage(0);
  }

  function closeProduct() {
    setSelectedProduct(null);
    setSelectedImage(0);
  }

  function openCart() {
    setSelectedProduct(null);
    setCheckoutOpen(false);
    setPurchaseComplete(false);
    setCartOpen(true);
  }

  function closeCart() {
    setCartOpen(false);
  }

  function openCheckout() {
    if (cartProducts.length === 0) {
      setMessage(
        "سبد خرید شما خالی است"
      );
      return;
    }

    const token = localStorage.getItem(
      "gaming_account_token"
    );

    const user = localStorage.getItem(
      "gaming_account_user"
    );

    if (!token || !user) {
      setMessage(
        "برای تکمیل خرید ابتدا وارد حساب خود شوید"
      );

      setTimeout(() => {
        window.location.href = "/profile";
      }, 700);

      return;
    }

    setCheckoutOpen(true);
  }

  function closeCheckout() {
    if (checkoutLoading) {
      return;
    }

    setCheckoutOpen(false);
  }

  function togglePassword(id: number) {
    setVisiblePasswords((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  }

  async function completePurchase() {
    const token = localStorage.getItem(
      "gaming_account_token"
    );

    const user = localStorage.getItem(
      "gaming_account_user"
    );

    if (!token || !user) {
      setCheckoutOpen(false);

      setMessage(
        "برای تکمیل خرید ابتدا وارد حساب خود شوید"
      );

      setTimeout(() => {
        window.location.href = "/profile";
      }, 700);

      return;
    }

    const cleanName = fullName.trim();

    const cleanPhone =
      phoneNumber.replace(/\s/g, "");

    if (!cleanName) {
      setMessage(
        "لطفاً نام و نام خانوادگی خود را وارد کنید"
      );
      return;
    }

    if (cleanName.length < 3) {
      setMessage(
        "لطفاً نام و نام خانوادگی را کامل وارد کنید"
      );
      return;
    }

    if (!cleanPhone) {
      setMessage(
        "لطفاً شماره موبایل خود را وارد کنید"
      );
      return;
    }

    if (!/^09\d{9}$/.test(cleanPhone)) {
      setMessage(
        "شماره موبایل باید با 09 شروع شود و 11 رقم باشد"
      );
      return;
    }

    if (cartProducts.length === 0) {
      setMessage(
        "سبد خرید شما خالی است"
      );

      setCheckoutOpen(false);
      return;
    }

    setCheckoutLoading(true);

    const purchased: PurchasedAccount[] = [];

    for (const product of cartProducts) {
      const { data, error } =
        await supabase.rpc(
          "create_purchase",
          {
            p_token: token,
            p_product_id: product.id,
            p_product_title: product.title,
            p_game: product.game,
            p_price: Number(product.price),
          }
        );

      if (error) {
        console.error(
          "create_purchase error:",
          error
        );

        setCheckoutLoading(false);

        setMessage(
          `ثبت سفارش ناموفق بود: ${error.message}`
        );

        return;
      }

      if (!data?.success) {
        setCheckoutLoading(false);

        setMessage(
          data?.error ||
            "ثبت سفارش ناموفق بود."
        );

        return;
      }

      purchased.push({
        purchaseId: Number(
          data.purchaseId
        ),
        productId: Number(
          data.productId
        ),
        productTitle:
          data.productTitle,
        game: data.game,
        accountUsername:
          data.accountUsername,
        accountPassword:
          data.accountPassword,
        price: Number(data.price),
      });
    }

    setPurchasedAccounts(purchased);

    setVisiblePasswords([]);

    setCart([]);

    localStorage.setItem(
      "gaming_account_cart",
      JSON.stringify([])
    );

    window.dispatchEvent(
      new Event("gaming-cart-updated")
    );

    setProducts((current) =>
      current.map((product) =>
        purchased.some(
          (item) =>
            item.productId === product.id
        )
          ? {
              ...product,
              isSold: true,
            }
          : product
      )
    );

    setCheckoutLoading(false);
    setCheckoutOpen(false);
    setCartOpen(false);

    setFullName("");
    setPhoneNumber("");

    setPurchaseComplete(true);
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 pb-24 text-white"
    >
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-wide sm:text-2xl">
              GAMING ACCOUNT
            </h1>

            <p className="text-[10px] text-slate-400 sm:text-xs">
              بازار خرید و فروش اکانت بازی
            </p>
          </div>

          <button
            onClick={() => {
              setSearchOpen(
                (current) => !current
              );

              if (searchOpen) {
                setSearchText("");
              }
            }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg transition ${
              searchOpen
                ? "border-white bg-white text-slate-950"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
            aria-label="جستجو"
          >
            {searchOpen ? "✕" : "🔍"}
          </button>
        </div>

        {searchOpen && (
          <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6">
            <div className="relative">
              <input
                autoFocus
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value
                  )
                }
                placeholder="نام بازی، عنوان اکانت یا توضیحات..."
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
              />

              {searchText && (
                <button
                  onClick={() =>
                    setSearchText("")
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-slate-900 p-6 shadow-2xl sm:p-10">
          <div className="max-w-2xl">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
              🎮 GAMING MARKET
            </span>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              اکانت بازی مورد علاقه‌ات را پیدا کن
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              خرید و فروش اکانت‌های بازی در یک محیط ساده، سریع و مناسب موبایل.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="mt-6 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:scale-105"
            >
              مشاهده اکانت‌ها
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-7 sm:px-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold">
            دسته‌بندی بازی‌ها
          </h3>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          <button
            onClick={() =>
              setActiveCategory(
                "همه بازی‌ها"
              )
            }
            className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-medium transition ${
              activeCategory ===
              "همه بازی‌ها"
                ? "border-white bg-white text-slate-950"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            همه بازی‌ها
          </button>

          {loadingGames ? (
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-slate-500">
              در حال دریافت بازی‌ها...
            </div>
          ) : (
            games.map((game) => (
              <button
                key={game.id}
                onClick={() =>
                  setActiveCategory(
                    game.name
                  )
                }
                className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-medium transition ${
                  activeCategory ===
                  game.name
                    ? "border-white bg-white text-slate-950"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {game.name}
              </button>
            ))
          )}
        </div>
      </section>

      <section
        id="products"
        className="mx-auto max-w-7xl px-4 pt-7 sm:px-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">
              {searchText
                ? "نتایج جستجو"
                : "اکانت‌های جدید"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {searchText
                ? `نتایج برای «${searchText}»`
                : "جدیدترین اکانت‌های فروش"}
            </p>
          </div>

          <span className="rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-400">
            {filteredProducts.length} اکانت
          </span>
        </div>

        {loadingProducts ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <div className="text-3xl">
              🎮
            </div>

            <p className="mt-3 text-sm text-slate-400">
              در حال دریافت اکانت‌ها...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-4xl">
              🔎
            </div>

            <h4 className="mt-4 font-bold">
              اکانتی پیدا نشد
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              {searchText
                ? "نتیجه‌ای برای جستجوی شما پیدا نشد."
                : "برای این بازی هنوز اکانتی ثبت نشده است."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(
              (product) => {
                const isLiked =
                  liked.includes(product.id);

                const isSaved =
                  saved.includes(product.id);

                const inCart =
                  cart.includes(product.id);

                const image =
                  product.images?.[0] ||
                  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80";

                return (
                  <article
                    key={product.id}
                    onClick={() =>
                      openProduct(product)
                    }
                    className={`group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:bg-white/[0.07] ${
                      product.isSold
                        ? "opacity-75"
                        : ""
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={image}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute left-2 top-2 rounded-xl bg-black/60 px-2 py-1 text-[10px] backdrop-blur">
                        {product.game}
                      </div>

                      {product.isSold && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
                          <span className="rounded-2xl border border-red-400/30 bg-red-500/20 px-5 py-2 text-sm font-black text-red-300">
                            فروخته شد
                          </span>
                        </div>
                      )}

                      <div className="absolute right-2 top-2 flex flex-col gap-2">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleLike(
                              product.id
                            );
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-lg backdrop-blur transition hover:scale-110 active:scale-95"
                          aria-label="پسندیدن"
                        >
                          {isLiked
                            ? "❤️"
                            : "♡"}
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleSave(
                              product.id
                            );
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition duration-200 hover:scale-110 active:scale-95 ${
                            isSaved
                              ? "border-white/30 bg-white text-slate-950"
                              : "border-white/10 bg-black/60 text-white"
                          }`}
                          aria-label={
                            isSaved
                              ? "حذف از ذخیره‌ها"
                              : "ذخیره اکانت"
                          }
                        >
                          <BookmarkIcon
                            saved={isSaved}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      <h4 className="line-clamp-2 min-h-10 text-sm font-bold leading-5">
                        {product.title}
                      </h4>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          ❤️{" "}
                          {product.likes +
                            (isLiked
                              ? 1
                              : 0)}
                        </span>

                        <span>
                          🔐 اطلاعات مخفی
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-base font-black">
                          {formatPrice(
                            product.price
                          )}

                          <span className="mr-1 text-[10px] font-normal text-slate-400">
                            تومان
                          </span>
                        </p>
                      </div>

                      <button
                        disabled={
                          product.isSold
                        }
                        onClick={(event) => {
                          event.stopPropagation();

                          addToCart(
                            product.id
                          );
                        }}
                        className={`mt-3 w-full rounded-xl py-2.5 text-xs font-bold transition ${
                          product.isSold
                            ? "cursor-not-allowed bg-white/5 text-slate-600"
                            : inCart
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-white text-slate-950 hover:bg-slate-200"
                        }`}
                      >
                        {product.isSold
                          ? "فروخته شد"
                          : inCart
                          ? "✓ داخل سبد خرید"
                          : "افزودن به سبد خرید"}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeProduct}
        >
          <div className="flex min-h-full items-center justify-center py-8">
            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
            >
              <button
                onClick={closeProduct}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-lg backdrop-blur"
              >
                ✕
              </button>

              <div className="relative aspect-square w-full bg-black sm:aspect-video">
                {selectedProduct.videoUrl &&
                selectedImage === -1 ? (
                  <video
                    src={
                      selectedProduct.videoUrl
                    }
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
                    alt={
                      selectedProduct.title
                    }
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

              {(selectedProduct.images &&
                selectedProduct.images.length >
                  1) ||
              selectedProduct.videoUrl ? (
                <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-black/20 p-3">
                  {selectedProduct.images?.map(
                    (image, index) => (
                      <button
                        key={
                          image + index
                        }
                        onClick={() =>
                          setSelectedImage(
                            index
                          )
                        }
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                          selectedImage ===
                          index
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
                      onClick={() =>
                        setSelectedImage(
                          -1
                        )
                      }
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 bg-white/5 text-2xl ${
                        selectedImage ===
                        -1
                          ? "border-white"
                          : "border-white/10"
                      }`}
                    >
                      🎬
                    </button>
                  )}
                </div>
              ) : null}

              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-xl bg-indigo-500/15 px-3 py-1 text-xs text-indigo-300">
                      {
                        selectedProduct.game
                      }
                    </span>

                    <h2 className="mt-3 text-xl font-black leading-8 sm:text-2xl">
                      {
                        selectedProduct.title
                      }
                    </h2>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() =>
                        toggleLike(
                          selectedProduct.id
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl transition hover:scale-105 active:scale-95"
                      aria-label="پسندیدن"
                    >
                      {liked.includes(
                        selectedProduct.id
                      )
                        ? "❤️"
                        : "♡"}
                    </button>

                    <button
                      onClick={() =>
                        toggleSave(
                          selectedProduct.id
                        )
                      }
                      className={`flex h-11 w-11 items-center justify-center rounded-full border transition duration-200 hover:scale-105 active:scale-95 ${
                        saved.includes(
                          selectedProduct.id
                        )
                          ? "border-white/30 bg-white text-slate-950"
                          : "border-white/10 bg-white/5 text-white"
                      }`}
                      aria-label={
                        saved.includes(
                          selectedProduct.id
                        )
                          ? "حذف از ذخیره‌ها"
                          : "ذخیره اکانت"
                      }
                    >
                      <BookmarkIcon
                        saved={saved.includes(
                          selectedProduct.id
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  ❤️{" "}
                  {selectedProduct.likes +
                    (liked.includes(
                      selectedProduct.id
                    )
                      ? 1
                      : 0)}{" "}
                  پسند
                </div>

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
                    disabled={
                      selectedProduct.isSold
                    }
                    onClick={() =>
                      addToCart(
                        selectedProduct.id
                      )
                    }
                    className={`rounded-2xl px-6 py-3.5 text-sm font-bold ${
                      selectedProduct.isSold
                        ? "cursor-not-allowed bg-white/5 text-slate-600"
                        : cart.includes(
                            selectedProduct.id
                          )
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white text-slate-950"
                    }`}
                  >
                    {selectedProduct.isSold
                      ? "این اکانت فروخته شده"
                      : cart.includes(
                          selectedProduct.id
                        )
                      ? "✓ داخل سبد خرید"
                      : "افزودن به سبد خرید"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-950">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
              <button
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-lg hover:bg-white/10"
              >
                →
              </button>

              <div className="text-center">
                <h1 className="text-lg font-black">
                  🛒 سبد خرید
                </h1>

                <p className="text-[10px] text-slate-500">
                  {cartProducts.length} اکانت
                </p>
              </div>

              <div className="w-10" />
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-4 py-6">
            {cartProducts.length === 0 ? (
              <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
                <div className="text-6xl">
                  🛒
                </div>

                <h2 className="mt-5 text-xl font-black">
                  سبد خرید خالی است
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  اکانت موردنظرت را انتخاب کن و با زدن دکمه «افزودن به سبد خرید» آن را اینجا قرار بده.
                </p>

                <button
                  onClick={closeCart}
                  className="mt-6 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950"
                >
                  مشاهده اکانت‌ها
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartProducts.map(
                    (product) => {
                      const image =
                        product.images?.[0] ||
                        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80";

                      return (
                        <div
                          key={
                            product.id
                          }
                          className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3 sm:p-4"
                        >
                          <button
                            onClick={() =>
                              openProduct(
                                product
                              )
                            }
                            className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28"
                          >
                            <img
                              src={image}
                              alt={
                                product.title
                              }
                              className="h-full w-full object-cover"
                            />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[10px] text-indigo-300">
                                  {
                                    product.game
                                  }
                                </p>

                                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-6">
                                  {
                                    product.title
                                  }
                                </h3>
                              </div>

                              <button
                                onClick={() =>
                                  removeFromCart(
                                    product.id
                                  )
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-sm text-red-400 hover:bg-red-500/20"
                                aria-label="حذف اکانت"
                              >
                                🗑️
                              </button>
                            </div>

                            <div className="mt-4 flex items-end justify-between gap-2">
                              <span className="text-xs text-slate-500">
                                اکانت
                              </span>

                              <p className="text-base font-black">
                                {formatPrice(
                                  product.price
                                )}{" "}
                                <span className="text-[9px] font-normal text-slate-500">
                                  تومان
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      تعداد اکانت
                    </span>

                    <span className="font-bold">
                      {cartProducts.length}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-slate-400">
                      مبلغ کل
                    </span>

                    <span className="text-xl font-black">
                      {formatPrice(
                        cartTotal
                      )}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        تومان
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={openCheckout}
                    className="mt-5 w-full rounded-2xl bg-white py-4 text-sm font-black text-slate-950 transition hover:bg-slate-200"
                  >
                    تکمیل خرید
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
              <button
                onClick={closeCheckout}
                disabled={checkoutLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-lg"
              >
                →
              </button>

              <h1 className="text-lg font-black">
                تکمیل سفارش
              </h1>

              <div className="w-10" />
            </div>
          </header>

          <div className="mx-auto max-w-md px-4 py-8">
            <div className="text-center">
              <div className="text-5xl">
                📦
              </div>

              <h2 className="mt-4 text-xl font-black">
                ثبت نهایی سفارش
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                در حال حاضر درگاه پرداخت فعال نیست. با ثبت سفارش، سفارش شما نهایی می‌شود و اطلاعات اکانت نمایش داده خواهد شد.
              </p>
            </div>

            <label className="mt-8 block text-sm font-bold">
              نام و نام خانوادگی
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value
                )
              }
              placeholder="مثلاً محمد سراغی"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
            />

            <label className="mt-5 block text-sm font-bold">
              شماره موبایل
            </label>

            <input
              type="tel"
              inputMode="numeric"
              dir="ltr"
              value={phoneNumber}
              onChange={(event) => {
                const value =
                  event.target.value.replace(
                    /[^0-9]/g,
                    ""
                  );

                setPhoneNumber(
                  value.slice(0, 11)
                );
              }}
              placeholder="09123456789"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
            />

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  تعداد اکانت
                </span>

                <span className="font-bold">
                  {cartProducts.length}
                </span>
              </div>

              <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                <span className="text-slate-400">
                  مبلغ کل
                </span>

                <span className="font-black">
                  {formatPrice(
                    cartTotal
                  )}{" "}
                  تومان
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-500/5 p-4 text-xs leading-6 text-amber-200/80">
              ⚠️ فعلاً پرداخت آنلاین نداریم. با زدن «تکمیل خرید» سفارش مستقیماً ثبت و اکانت تحویل داده می‌شود.
            </div>

            <button
              disabled={checkoutLoading}
              onClick={completePurchase}
              className="mt-5 w-full rounded-2xl bg-white py-4 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checkoutLoading
                ? "در حال ثبت سفارش..."
                : "تکمیل خرید"}
            </button>
          </div>
        </div>
      )}

      {purchaseComplete && (
        <div className="fixed inset-0 z-[250] overflow-y-auto bg-slate-950">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
              <div className="w-10" />

              <h1 className="text-lg font-black">
                سفارش شما
              </h1>

              <div className="w-10" />
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-4xl">
                ✓
              </div>

              <h2 className="mt-5 text-2xl font-black">
                سفارش با موفقیت ثبت شد
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                اطلاعات ورود اکانت‌های خریداری‌شده را در پایین مشاهده می‌کنید.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {purchasedAccounts.map(
                (account) => {
                  const passwordVisible =
                    visiblePasswords.includes(
                      account.purchaseId
                    );

                  return (
                    <div
                      key={
                        account.purchaseId
                      }
                      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="rounded-xl bg-indigo-500/15 px-3 py-1 text-xs text-indigo-300">
                            {account.game}
                          </span>

                          <h3 className="mt-3 text-base font-black">
                            {
                              account.productTitle
                            }
                          </h3>
                        </div>

                        <span className="rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                          تحویل شد
                        </span>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs text-slate-500">
                            ایمیل / نام کاربری
                          </p>

                          <p
                            dir="ltr"
                            className="mt-2 break-all text-sm font-bold text-white"
                          >
                            {
                              account.accountUsername
                            }
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-500">
                              رمز عبور
                            </p>

                            <button
                              onClick={() =>
                                togglePassword(
                                  account.purchaseId
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:bg-white/10"
                              aria-label={
                                passwordVisible
                                  ? "مخفی کردن رمز"
                                  : "نمایش رمز"
                              }
                            >
                              <EyeIcon
                                open={
                                  passwordVisible
                                }
                              />
                            </button>
                          </div>

                          <p
                            dir="ltr"
                            className="mt-2 break-all text-sm font-bold text-white"
                          >
                            {passwordVisible
                              ? account.accountPassword
                              : "••••••••••••"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-500/5 p-4 text-xs leading-6 text-slate-400">
              🔐 این اطلاعات فقط در اختیار حساب کاربری شما قرار گرفته است. برای امنیت، اطلاعات ورود را در اختیار دیگران قرار ندهید.
            </div>

            <button
              onClick={() => {
                setPurchaseComplete(false);
                setPurchasedAccounts([]);
                setVisiblePasswords([]);
              }}
              className="mt-5 w-full rounded-2xl bg-white py-4 text-sm font-black text-slate-950"
            >
              بازگشت به فروشگاه
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed bottom-24 left-1/2 z-[300] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white shadow-2xl">
          {message}
        </div>
      )}
    </main>
  );
}