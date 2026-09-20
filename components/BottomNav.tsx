"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
    >
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 21V14H15V21"
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
      className="h-5 w-5"
    >
      <path
        d="M3 4H5L7.2 15.2C7.4 16.2 8.3 17 9.3 17H17.5C18.4 17 19.2 16.4 19.5 15.5L21 9H6"
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
        cx="17"
        cy="20"
        r="1.3"
        fill="currentColor"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
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

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);

  function loadCartCount() {
    try {
      const savedCart = localStorage.getItem(
        "gaming_account_cart"
      );

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      const parsed = JSON.parse(savedCart);

      if (Array.isArray(parsed)) {
        setCartCount(parsed.length);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  }

  useEffect(() => {
    // اولین بار بعد از mount
    const initialTimer = window.setTimeout(() => {
      loadCartCount();
    }, 0);

    const handleCartUpdate = () => {
      // جلوگیری از setState همزمان با render کامپوننت دیگر
      window.setTimeout(() => {
        loadCartCount();
      }, 0);
    };

    const handleStorage = () => {
      window.setTimeout(() => {
        loadCartCount();
      }, 0);
    };

    window.addEventListener(
      "gaming-cart-updated",
      handleCartUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.clearTimeout(initialTimer);

      window.removeEventListener(
        "gaming-cart-updated",
        handleCartUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHome =
    pathname === "/" || pathname === "";

  const isProfile =
    pathname.startsWith("/profile");

  return (
    <nav
      dir="ltr"
      className="fixed bottom-0 left-0 right-0 z-[200] h-14 border-t border-white/10 bg-slate-950"
    >
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-8">

        {/* پروفایل */}

        <button
          type="button"
          onClick={() =>
            router.push("/profile")
          }
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition ${
            isProfile
              ? "text-white"
              : "text-slate-500 hover:text-white"
          }`}
        >
          <ProfileIcon />
          <span>پروفایل</span>
        </button>

        {/* سبد خرید */}

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "/?cart=open";
          }}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500 transition hover:text-white"
        >
          <div className="relative">
            <CartIcon />

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black leading-none text-white ring-2 ring-slate-950">
                {cartCount > 9
                  ? "9+"
                  : cartCount}
              </span>
            )}
          </div>

          <span>سبد خرید</span>
        </button>

        {/* خانه */}

        <button
          type="button"
          onClick={() => {
            if (isHome) {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            } else {
              router.push("/");
            }
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition ${
            isHome
              ? "text-indigo-400"
              : "text-slate-500 hover:text-white"
          }`}
        >
          <HomeIcon />
          <span>خانه</span>
        </button>

      </div>
    </nav>
  );
}