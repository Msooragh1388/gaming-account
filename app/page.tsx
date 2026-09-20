"use client";

import { useEffect, useRef, useState } from "react";
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
  backupPassword1: string | null;
  backupPassword2: string | null;
  price: number;
};

function HeartIcon({ liked }: { liked: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={liked ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 transition-all duration-200 ${
        liked ? "scale-110" : "scale-100"
      }`}
    >
      <path
        d="M20.84 4.61C19.77 3.54 18.35 3 16.84 3C15.33 3 13.91 3.54 12.84 4.61L12 5.45L11.16 4.61C8.94 2.39 5.34 2.39 3.12 4.61C0.9 6.83 0.9 10.43 3.12 12.65L12 21.53L20.88 12.65C23.1 10.43 23.1 6.83 20.88 4.61H20.84Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
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

  const [activeCategory, setActiveCategory] = useState("همه بازی‌ها");

  const [liked, setLiked] = useState<number[]>([]);
  const [liking, setLiking] = useState<number[]>([]);
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

  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "gateway"
  >("wallet");

  const [walletBalance, setWalletBalance] = useState<number | null>(
    null
  );

  const [walletLoading, setWalletLoading] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const [purchasedAccounts, setPurchasedAccounts] =
    useState<PurchasedAccount[]>([]);

  const [visiblePasswords, setVisiblePasswords] =
    useState<number[]>([]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  async function loadGames() {
    setLoadingGames(true);

    const { data, error } = await supabase
      .from("Game")
      .select("*")
      .eq("active", true)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error(error);
      setMessage(`خطا در دریافت بازی‌ها: ${error.message}`);
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
      .order("createdAt", { ascending: false });

    if (error) {
      console.error(error);
      setMessage(`خطا در دریافت اکانت‌ها: ${error.message}`);
      setLoadingProducts(false);
      return;
    }

    let productsWithLikes = data || [];

    try {
      const likesResponse = await fetch("/api/likes/counts");
      const likesData = await likesResponse.json();

      if (
        likesResponse.ok &&
        likesData?.success &&
        Array.isArray(likesData.counts)
      ) {
        const likesMap = new Map<number, number>();

        for (const item of likesData.counts) {
          const productId = Number(item.productId);
          const likes = Number(item.likes);

          if (Number.isInteger(productId) && productId > 0) {
            likesMap.set(
              productId,
              Number.isFinite(likes) ? likes : 0
            );
          }
        }

        productsWithLikes = productsWithLikes.map((product) => ({
          ...product,
          likes: likesMap.get(Number(product.id)) ?? 0,
        }));
      }
    } catch (error) {
      console.error("Load like counts error:", error);
    }

    setProducts(productsWithLikes);
    setLoadingProducts(false);
  }

  async function loadUserLikes() {
    const token = localStorage.getItem("gaming_account_token");
    const user = localStorage.getItem("gaming_account_user");

    if (!token || !user) {
      setLiked([]);
      return;
    }

    try {
      const response = await fetch("/api/likes/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        setLiked([]);
        return;
      }

      const likedIds = Array.isArray(data.likedProductIds)
        ? data.likedProductIds
            .map((id: unknown) => Number(id))
            .filter(
              (id: number) => Number.isInteger(id) && id > 0
            )
        : [];

      setLiked(likedIds);
    } catch (error) {
      console.error("Load likes error:", error);
      setLiked([]);
    }
  }

  useEffect(() => {
    document.title = "۱۵۷۱۲۶۱۹";

    loadGames();
    loadProducts();
    loadUserLikes();

    const savedProducts = localStorage.getItem(
      "gaming_account_saved"
    );

    if (savedProducts) {
      try {
        const parsedSaved = JSON.parse(savedProducts);

        if (Array.isArray(parsedSaved)) {
          setSaved(parsedSaved.map((id) => Number(id)));
        }
      } catch {
        localStorage.removeItem("gaming_account_saved");
      }
    }

    const savedCart = localStorage.getItem("gaming_account_cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart.map((id) => Number(id)));
        }
      } catch {
        localStorage.removeItem("gaming_account_cart");
      }
    }

    const params = new URLSearchParams(window.location.search);

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
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [message]);

  const normalizedSearch = searchText.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "همه بازی‌ها" ||
      product.game === activeCategory;

    const matchesSearch =
      normalizedSearch === "" ||
      product.title.toLowerCase().includes(normalizedSearch) ||
      product.game.toLowerCase().includes(normalizedSearch) ||
      (product.description || "")
        .toLowerCase()
        .includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const cartProducts = products.filter(
    (product) =>
      cart.includes(product.id) && !product.isSold
  );

  const cartTotal = cartProducts.reduce(
    (total, product) => total + Number(product.price),
    0
  );

  async function toggleLike(id: number) {
    const token = localStorage.getItem("gaming_account_token");
    const user = localStorage.getItem("gaming_account_user");

    if (!token || !user) {
      setMessage("برای لایک کردن ابتدا وارد حساب شوید");

      setTimeout(() => {
        window.location.href = "/profile";
      }, 700);

      return;
    }

    if (liking.includes(id)) {
      return;
    }

    setLiking((current) =>
      current.includes(id) ? current : [...current, id]
    );

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          productId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        if (
          data?.loggedIn === false ||
          response.status === 401
        ) {
          setMessage(
            "برای لایک کردن ابتدا وارد حساب شوید"
          );

          setTimeout(() => {
            window.location.href = "/profile";
          }, 700);
        } else {
          setMessage(
            data?.error || "ثبت لایک ناموفق بود"
          );
        }

        return;
      }

      const likedNow = Boolean(data.liked);
      const likesNow = Number(data.likes);

      setLiked((current) => {
        if (likedNow) {
          if (current.includes(id)) {
            return current;
          }

          return [...current, id];
        }

        return current.filter((item) => item !== id);
      });

      setProducts((current) =>
        current.map((product) =>
          product.id === id
            ? {
                ...product,
                likes: Number.isFinite(likesNow)
                  ? likesNow
                  : product.likes,
              }
            : product
        )
      );

      setSelectedProduct((current) =>
        current && current.id === id
          ? {
              ...current,
              likes: Number.isFinite(likesNow)
                ? likesNow
                : current.likes,
            }
          : current
      );
    } catch (error) {
      console.error("Like error:", error);
      setMessage("خطا در ارتباط با سرور");
    } finally {
      setLiking((current) =>
        current.filter((item) => item !== id)
      );
    }
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
    const product = products.find((item) => item.id === id);

    if (!product) return;

    if (product.isSold) {
      setMessage("این اکانت فروخته شده است");
      return;
    }

    if (cart.includes(id)) {
      setMessage("این اکانت قبلاً در سبد خرید است");
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

    setMessage("اکانت به سبد خرید اضافه شد");
  }

  function removeFromCart(id: number) {
    setCart((current) => {
      const newCart = current.filter((item) => item !== id);

      localStorage.setItem(
        "gaming_account_cart",
        JSON.stringify(newCart)
      );

      window.dispatchEvent(
        new Event("gaming-cart-updated")
      );

      return newCart;
    });

    setMessage("اکانت از سبد خرید حذف شد");
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("fa-IR").format(price);
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedImage(0);
    touchStartX.current = null;
    touchStartY.current = null;
  }

  function closeProduct() {
    setSelectedProduct(null);
    setSelectedImage(0);
    touchStartX.current = null;
    touchStartY.current = null;
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

  async function loadWalletBalance() {
    const token = localStorage.getItem(
      "gaming_account_token"
    );

    if (!token) {
      setWalletBalance(null);
      return;
    }

    setWalletLoading(true);

    try {
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          action: "get",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Wallet balance error:", data);
        setWalletBalance(null);
        return;
      }

      const balance = Number(data?.wallet?.balance);

      if (Number.isFinite(balance)) {
        setWalletBalance(balance);
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      console.error("Load wallet balance error:", error);
      setWalletBalance(null);
    } finally {
      setWalletLoading(false);
    }
  }

  async function openCheckout() {
    if (cartProducts.length === 0) {
      setMessage("سبد خرید شما خالی است");
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

    setPaymentMethod("wallet");
    setCheckoutOpen(true);

    await loadWalletBalance();
  }

  function closeCheckout() {
    if (checkoutLoading) return;
    setCheckoutOpen(false);
  }

  function togglePassword(id: number) {
    setVisiblePasswords((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    if (
      !selectedProduct ||
      !selectedProduct.images ||
      selectedProduct.images.length === 0
    ) {
      return;
    }

    const touch = event.touches[0];

    if (!touch) return;

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }

  function handleTouchEnd(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    if (
      !selectedProduct ||
      !selectedProduct.images ||
      selectedProduct.images.length === 0
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const deltaX =
      touch.clientX - touchStartX.current;

    const deltaY =
      touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (
      Math.abs(deltaX) < 50 ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    const imageCount =
      selectedProduct.images.length;

    const lastImageIndex = imageCount - 1;

    const hasVideo =
      Boolean(selectedProduct.videoUrl);

    if (deltaX > 0) {
      setSelectedImage((current) => {
        if (current === -1) {
          return 0;
        }

        if (current < lastImageIndex) {
          return current + 1;
        }

        if (
          current === lastImageIndex &&
          hasVideo
        ) {
          return -1;
        }

        return current;
      });

      return;
    }

    setSelectedImage((current) => {
      if (current === -1) {
        return lastImageIndex;
      }

      if (current > 0) {
        return current - 1;
      }

      return current;
    });
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

    if (cartProducts.length === 0) {
      setMessage("سبد خرید شما خالی است");
      setCheckoutOpen(false);
      return;
    }

    if (paymentMethod === "gateway") {
      setMessage("درگاه پرداخت هنوز فعال نشده است");
      return;
    }

    setCheckoutLoading(true);

    try {
      const productIds = cartProducts
        .map((product) => Number(product.id))
        .filter(
          (id) => Number.isInteger(id) && id > 0
        );

      if (productIds.length === 0) {
        setMessage(
          "محصول معتبری برای خرید وجود ندارد"
        );

        setCheckoutLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc(
        "purchase_with_wallet",
        {
          p_token: token,
          p_product_ids: productIds,
        }
      );

      if (error) {
        console.error(
          "purchase_with_wallet error:",
          error
        );

        setMessage(
          `پرداخت ناموفق بود: ${error.message}`
        );

        setCheckoutLoading(false);
        return;
      }

      if (!data?.success) {
        const balance = Number(
          data?.balance ??
            walletBalance ??
            0
        );

        const total = Number(
          data?.total ??
            cartTotal
        );

        setWalletBalance(balance);

        if (
          data?.error ===
          "موجودی کیف پول کافی نیست."
        ) {
          setMessage(
            `موجودی کافی نیست. ${formatPrice(
              Math.max(total - balance, 0)
            )} تومان دیگر نیاز دارید.`
          );
        } else {
          setMessage(
            data?.error ||
              "پرداخت و ثبت سفارش ناموفق بود."
          );
        }

        setCheckoutLoading(false);
        return;
      }

      const accounts = Array.isArray(
        data.purchases
      )
        ? data.purchases
        : [];

      const purchased: PurchasedAccount[] =
        accounts.map((account: any) => ({
          purchaseId: Number(
            account.purchaseId
          ),

          productId: Number(
            account.productId
          ),

          productTitle: String(
            account.productTitle ?? ""
          ),

          game: String(
            account.game ?? ""
          ),

          accountUsername: String(
            account.accountUsername ?? ""
          ),

          accountPassword: String(
            account.accountPassword ?? ""
          ),

          backupPassword1:
            account.backupPassword1 ?? null,

          backupPassword2:
            account.backupPassword2 ?? null,

          price: Number(
            account.price ?? 0
          ),
        }));

      if (purchased.length === 0) {
        setMessage(
          "خرید انجام شد اما اطلاعات سفارش دریافت نشد."
        );

        setCheckoutLoading(false);
        return;
      }

      setPurchasedAccounts(purchased);

      setVisiblePasswords([]);

      setWalletBalance(
        Number(data.newBalance ?? 0)
      );

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

      setPurchaseComplete(true);
    } catch (error) {
      console.error(
        "Complete purchase error:",
        error
      );

      setCheckoutLoading(false);

      setMessage(
        "خطایی هنگام پرداخت و ثبت خرید رخ داد."
      );
    }
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
              setSearchOpen((current) => !current);

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
                  setSearchText(event.target.value)
                }
                placeholder="نام بازی، عنوان اکانت یا توضیحات..."
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
              />

              {searchText && (
                <button
                  onClick={() => setSearchText("")}
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
              setActiveCategory("همه بازی‌ها")
            }
            className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-medium transition ${
              activeCategory === "همه بازی‌ها"
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
                  setActiveCategory(game.name)
                }
                className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-medium transition ${
                  activeCategory === game.name
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
            <div className="text-3xl">🎮</div>

            <p className="mt-3 text-sm text-slate-400">
              در حال دریافت اکانت‌ها...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-4xl">🔎</div>

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
            {filteredProducts.map((product) => {
              const isLiked = liked.includes(product.id);
              const isLiking = liking.includes(product.id);
              const isSaved = saved.includes(product.id);
              const inCart = cart.includes(product.id);

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
                        type="button"
                        disabled={isLiking}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void toggleLike(product.id);
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition duration-200 hover:scale-110 active:scale-95 disabled:cursor-wait disabled:opacity-70 ${
                          isLiked
                            ? "border-red-400/50 bg-red-500/30 text-red-500 shadow-lg shadow-red-500/30"
                            : "border-white/10 bg-black/60 text-white"
                        }`}
                        aria-label={
                          isLiked
                            ? "حذف لایک"
                            : "پسندیدن"
                        }
                        aria-pressed={isLiked}
                      >
                        <HeartIcon liked={isLiked} />
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleSave(product.id);
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
                        <BookmarkIcon saved={isSaved} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <h4 className="line-clamp-2 min-h-10 text-sm font-bold leading-5">
                      {product.title}
                    </h4>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        ❤️ {product.likes}
                      </span>

                      <span>
                        🔐 اطلاعات مخفی
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-base font-black">
                        {formatPrice(product.price)}

                        <span className="mr-1 text-[10px] font-normal text-slate-400">
                          تومان
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={product.isSold}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        addToCart(product.id);
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
            })}
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
                type="button"
                onClick={closeProduct}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-lg backdrop-blur"
              >
                ✕
              </button>

              <div
                className="relative aspect-square w-full bg-black sm:aspect-video"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: "pan-y" }}
              >
                {selectedProduct.videoUrl &&
                selectedImage === -1 ? (
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

              {((selectedProduct.images &&
                selectedProduct.images.length > 1) ||
                selectedProduct.videoUrl) && (
                <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-black/20 p-3">
                  {selectedProduct.images?.map(
                    (image, index) => (
                      <button
                        type="button"
                        key={image + index}
                        onClick={() =>
                          setSelectedImage(index)
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

              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-xl bg-indigo-500/15 px-3 py-1 text-xs text-indigo-300">
                      {selectedProduct.game}
                    </span>

                    <h2 className="mt-3 text-xl font-black leading-8 sm:text-2xl">
                      {selectedProduct.title}
                    </h2>
                  </div>

                  <div className="flex shrink-0 gap-2">
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
                      className={`flex h-11 w-11 items-center justify-center rounded-full border transition duration-200 hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-70 ${
                        liked.includes(
                          selectedProduct.id
                        )
                          ? "border-red-400/50 bg-red-500/30 text-red-500 shadow-lg shadow-red-500/30"
                          : "border-white/10 bg-white/5 text-white"
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

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        toggleSave(
                          selectedProduct.id
                        );
                      }}
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
                  ❤️ {selectedProduct.likes} پسند
                </div>

                {selectedProduct.description && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-bold">
                      توضیحات اکانت
                    </h3>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                      {selectedProduct.description}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-500/5 p-4">
                  <span className="text-xl">🔐</span>

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
                    type="button"
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
                type="button"
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
                <div className="text-6xl">🛒</div>

                <h2 className="mt-5 text-xl font-black">
                  سبد خرید خالی است
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  اکانت موردنظرت را انتخاب کن و با زدن دکمه «افزودن به سبد خرید» آن را اینجا قرار بده.
                </p>

                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-6 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950"
                >
                  مشاهده اکانت‌ها
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartProducts.map((product) => {
                    const image =
                      product.images?.[0] ||
                      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80";

                    return (
                      <div
                        key={product.id}
                        className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3 sm:p-4"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openProduct(product)
                          }
                          className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28"
                        >
                          <img
                            src={image}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[10px] text-indigo-300">
                                {product.game}
                              </p>

                              <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-6">
                                {product.title}
                              </h3>
                            </div>

                            <button
                              type="button"
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
                  })}
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
                      {formatPrice(cartTotal)}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        تومان
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
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
                type="button"
                onClick={closeCheckout}
                disabled={checkoutLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-lg disabled:opacity-50"
              >
                →
              </button>

              <h1 className="text-lg font-black">
                تکمیل خرید
              </h1>

              <div className="w-10" />
            </div>
          </header>

          <div className="mx-auto max-w-md px-4 py-8">
            <div className="text-center">
              <div className="text-5xl">💳</div>

              <h2 className="mt-4 text-xl font-black">
                انتخاب روش پرداخت
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                روش پرداخت موردنظر خود را انتخاب کنید.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="mt-8 w-full rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-right opacity-60"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                  🔒
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black">
                      درگاه پرداخت
                    </h3>

                    <span className="rounded-xl bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                      به‌زودی
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    پرداخت آنلاین فعلاً فعال نیست.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setPaymentMethod("wallet")
              }
              disabled={checkoutLoading}
              className={`mt-3 w-full rounded-3xl border p-5 text-right transition ${
                paymentMethod === "wallet"
                  ? "border-emerald-400/40 bg-emerald-500/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                    paymentMethod === "wallet"
                      ? "bg-emerald-500/20"
                      : "bg-white/5"
                  }`}
                >
                  💰
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black">
                      کیف پول
                    </h3>

                    {paymentMethod === "wallet" && (
                      <span className="text-lg text-emerald-400">
                        ✓
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    پرداخت مستقیم از موجودی کیف پول
                  </p>
                </div>
              </div>
            </button>

            <div className="mt-5 rounded-3xl border border-indigo-400/10 bg-indigo-500/5 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  موجودی کیف پول
                </span>

                {walletLoading ? (
                  <span className="text-xs text-slate-500">
                    در حال دریافت...
                  </span>
                ) : walletBalance !== null ? (
                  <span className="text-base font-black text-white">
                    {formatPrice(walletBalance)} تومان
                  </span>
                ) : (
                  <span className="text-xs text-red-300">
                    دریافت موجودی ناموفق بود
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
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
                  {formatPrice(cartTotal)} تومان
                </span>
              </div>

              {walletBalance !== null && (
                <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                  <span className="text-slate-400">
                    موجودی پس از خرید
                  </span>

                  <span
                    className={`font-bold ${
                      walletBalance >= cartTotal
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {walletBalance >= cartTotal
                      ? `${formatPrice(
                          walletBalance - cartTotal
                        )} تومان`
                      : "موجودی کافی نیست"}
                  </span>
                </div>
              )}
            </div>

            {walletBalance !== null &&
              walletBalance < cartTotal && (
                <div className="mt-4 rounded-2xl border border-red-400/10 bg-red-500/5 p-4 text-xs leading-6 text-red-200/80">
                  ⚠️ موجودی کیف پول برای این خرید کافی نیست.
                  <br />
                  مبلغ موردنیاز:{" "}
                  {formatPrice(
                    cartTotal - walletBalance
                  )}{" "}
                  تومان
                </div>
              )}

            {walletBalance !== null &&
              walletBalance >= cartTotal && (
                <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-500/5 p-4 text-xs leading-6 text-emerald-200/80">
                  ✓ موجودی کیف پول برای خرید کافی است.
                  <br />
                  پس از پرداخت، مبلغ خرید از کیف پول شما کسر می‌شود.
                </div>
              )}

            <button
              type="button"
              disabled={
                checkoutLoading ||
                walletLoading ||
                paymentMethod !== "wallet" ||
                walletBalance === null ||
                walletBalance < cartTotal
              }
              onClick={completePurchase}
              className="mt-5 w-full rounded-2xl bg-white py-4 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {checkoutLoading
                ? "در حال پرداخت و ثبت خرید..."
                : "پرداخت با کیف پول"}
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

            <div className="mt-6 rounded-3xl border border-emerald-400/10 bg-emerald-500/5 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  پرداخت از کیف پول
                </span>

                <span className="font-black text-emerald-300">
                  موفق ✓
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {purchasedAccounts.map((account) => {
                const passwordVisible =
                  visiblePasswords.includes(
                    account.purchaseId
                  );

                return (
                  <div
                    key={account.purchaseId}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-xl bg-indigo-500/15 px-3 py-1 text-xs text-indigo-300">
                          {account.game}
                        </span>

                        <h3 className="mt-3 text-base font-black">
                          {account.productTitle}
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
                          {account.accountUsername}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-slate-500">
                            رمز عبور
                          </p>

                          <button
                            type="button"
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

                      {account.backupPassword1 && (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-500">
                              رمز بکاپ اول
                            </p>

                            <button
                              type="button"
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
                              ? account.backupPassword1
                              : "••••••••••••"}
                          </p>
                        </div>
                      )}

                      {account.backupPassword2 && (
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-500">
                              رمز بکاپ دوم
                            </p>

                            <button
                              type="button"
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
                              ? account.backupPassword2
                              : "••••••••••••"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-500/5 p-4 text-xs leading-6 text-slate-400">
              🔐 این اطلاعات فقط در اختیار حساب کاربری شما قرار گرفته است. برای امنیت، اطلاعات ورود را در اختیار دیگران قرار ندهید.
            </div>

            <button
              type="button"
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