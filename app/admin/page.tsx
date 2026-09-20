"use client";

import {
ChangeEvent,
FormEvent,
useEffect,
useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const STORAGE_BUCKET = "product-media";

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

type FullProduct = Product & {
accountUsername: string;
accountPassword: string;
backupPassword1: string | null;
backupPassword2: string | null;
};

type WalletTransaction = {
id: number;
userId: number;
type: "deposit" | "withdraw";
amount: number;
status: "pending" | "approved" | "rejected";
cardId: number | null;
description: string | null;
createdAt: string;
updatedAt: string;
};

function formatPrice(amount: number) {
return new Intl.NumberFormat("fa-IR").format(
amount
);
}

export default function AdminPage() {
const router = useRouter();

// =========================================
// DATA
// =========================================

const [products, setProducts] =
useState<Product[]>([]);

const [games, setGames] =
useState<Game[]>([]);

const [purchaseCount, setPurchaseCount] =
useState(0);

const [transactionCount, setTransactionCount] =
useState(0);

const [hasNewTransaction, setHasNewTransaction] =
useState(false);

// =========================================
// LOADING / MESSAGE
// =========================================

const [loadingProducts, setLoadingProducts] =
useState(true);

const [loadingGames, setLoadingGames] =
useState(true);

const [message, setMessage] =
useState("");

const [errorMessage, setErrorMessage] =
useState("");

// =========================================
// EDIT / ADD MODAL
// =========================================

const [showModal, setShowModal] =
useState(false);

const [editingId, setEditingId] =
useState<number | null>(null);

const [saving, setSaving] =
useState(false);

// =========================================
// FORM
// =========================================

const [selectedGame, setSelectedGame] =
useState("");

const [title, setTitle] =
useState("");

const [description, setDescription] =
useState("");

const [price, setPrice] =
useState("");

const [accountUsername, setAccountUsername] =
useState("");

const [accountPassword, setAccountPassword] =
useState("");

const [backupPassword1, setBackupPassword1] =
useState("");

const [backupPassword2, setBackupPassword2] =
useState("");

// =========================================
// IMAGES
// =========================================

const [selectedImages, setSelectedImages] =
useState<File[]>([]);

const [imagePreviews, setImagePreviews] =
useState<string[]>([]);

const [existingImages, setExistingImages] =
useState<string[]>([]);

const [mainImageIndex, setMainImageIndex] =
useState(0);

// =========================================
// VIDEO
// =========================================

const [selectedVideo, setSelectedVideo] =
useState<File | null>(null);

const [videoPreview, setVideoPreview] =
useState("");

const [existingVideoUrl, setExistingVideoUrl] =
useState("");

// =========================================
// LOAD GAMES
// =========================================

async function loadGames() {
try {
setLoadingGames(true);


  const { data, error } = await supabase
    .from("Game")
    .select(
      'id, name, slug, active, "createdAt"'
    )
    .order("id", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  setGames(
    Array.isArray(data)
      ? (data as Game[])
      : []
  );
} catch (error) {
  console.error(
    "loadGames error:",
    error
  );

  setErrorMessage(
    "خطا در دریافت بازی‌ها."
  );
} finally {
  setLoadingGames(false);
}


}

// =========================================
// LOAD PRODUCTS
// =========================================

async function loadProducts() {
try {
setLoadingProducts(true);


  const { data, error } = await supabase
    .from("ProductPublic")
    .select(
      'id, game, title, description, price, images, "videoUrl", "isSold", likes, "createdAt", "updatedAt"'
    )
    .order("id", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  setProducts(
    Array.isArray(data)
      ? (data as Product[])
      : []
  );
} catch (error) {
  console.error(
    "loadProducts error:",
    error
  );

  setErrorMessage(
    "خطا در دریافت اکانت‌ها."
  );
} finally {
  setLoadingProducts(false);
}


}

// =========================================
// LOAD PURCHASE COUNT
// =========================================

async function loadPurchaseCount() {
try {
const { data, error } =
await supabase.rpc(
"get_admin_purchases"
);


  if (error) {
    console.error(
      "loadPurchaseCount error:",
      error
    );
    return;
  }

  const count = Array.isArray(data)
    ? data.length
    : 0;

  setPurchaseCount(count);
} catch (error) {
  console.error(
    "loadPurchaseCount error:",
    error
  );
}


}

// =========================================
// LOAD TRANSACTION COUNT
// =========================================

async function loadTransactionCount() {
try {
const response = await fetch(
"/api/admin/transactions",
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
action: "get",
}),
}
);


  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Admin transactions error:",
      data?.error
    );
    return;
  }

  const transactions: WalletTransaction[] =
    Array.isArray(data?.transactions)
      ? data.transactions
      : [];

  // تعداد کل تراکنش‌ها
  setTransactionCount(
    transactions.length
  );

  // =====================================
  // CHECK NEW TRANSACTION
  // =====================================

  const lastViewed =
    localStorage.getItem(
      "admin_transactions_last_viewed"
    );

  /*
   * اگر هنوز هیچ زمان آخرین بازدیدی ثبت نشده،
   * آخرین تراکنش فعلی را به عنوان نقطه شروع
   * در نظر می‌گیریم تا تراکنش‌های قدیمی
   * به عنوان «جدید» نمایش داده نشوند.
   */
  if (!lastViewed) {
    if (transactions.length > 0) {
      const latestCreatedAt =
        transactions.reduce(
          (latest, transaction) => {
            const currentTime =
              new Date(
                transaction.createdAt
              ).getTime();

            return currentTime > latest
              ? currentTime
              : latest;
          },
          0
        );

      if (latestCreatedAt > 0) {
        localStorage.setItem(
          "admin_transactions_last_viewed",
          new Date(
            latestCreatedAt
          ).toISOString()
        );
      }
    } else {
      localStorage.setItem(
        "admin_transactions_last_viewed",
        new Date().toISOString()
      );
    }

    setHasNewTransaction(false);
    return;
  }

  const lastViewedTime =
    new Date(lastViewed).getTime();

  if (
    Number.isNaN(lastViewedTime)
  ) {
    setHasNewTransaction(false);
    return;
  }

  const hasNew = transactions.some(
    (transaction) => {
      const createdTime =
        new Date(
          transaction.createdAt
        ).getTime();

      return (
        createdTime > lastViewedTime
      );
    }
  );

  setHasNewTransaction(hasNew);
} catch (error) {
  console.error(
    "loadTransactionCount error:",
    error
  );
}


}

// =========================================
// INITIAL LOAD + TRANSACTION POLLING
// =========================================

useEffect(() => {
loadGames();
loadProducts();
loadPurchaseCount();
loadTransactionCount();


const interval = setInterval(() => {
  loadTransactionCount();
}, 10000);

return () => {
  clearInterval(interval);
};


}, []);

// =========================================
// RESET FORM
// =========================================

function resetForm() {
setEditingId(null);


setSelectedGame("");
setTitle("");
setDescription("");
setPrice("");

setAccountUsername("");
setAccountPassword("");
setBackupPassword1("");
setBackupPassword2("");

setSelectedImages([]);
setImagePreviews([]);
setExistingImages([]);
setMainImageIndex(0);

setSelectedVideo(null);
setVideoPreview("");
setExistingVideoUrl("");

setMessage("");
setErrorMessage("");


}

// =========================================
// OPEN ADD MODAL
// =========================================

function openAddModal() {
resetForm();


if (games.length > 0) {
  setSelectedGame(games[0].name);
}

setShowModal(true);


}

// =========================================
// OPEN EDIT MODAL
// =========================================

async function openEditModal(
product: Product
) {
try {
setMessage("");
setErrorMessage("");


  setEditingId(product.id);
  setSelectedGame(product.game);
  setTitle(product.title);
  setDescription(
    product.description || ""
  );
  setPrice(String(product.price));

  setExistingImages(
    Array.isArray(product.images)
      ? product.images
      : []
  );

  setExistingVideoUrl(
    product.videoUrl || ""
  );

  setSelectedImages([]);
  setImagePreviews([]);
  setSelectedVideo(null);
  setVideoPreview("");
  setMainImageIndex(0);

  setShowModal(true);

  const { data, error } =
    await supabase.rpc(
      "get_product_account",
      {
        p_product_id: product.id,
      }
    );

  if (error) {
    throw error;
  }

  const account =
    Array.isArray(data)
      ? data[0]
      : data;

  if (account) {
    setAccountUsername(
      account.accountUsername || ""
    );

    setAccountPassword(
      account.accountPassword || ""
    );

    setBackupPassword1(
      account.backupPassword1 || ""
    );

    setBackupPassword2(
      account.backupPassword2 || ""
    );
  }
} catch (error) {
  console.error(
    "openEditModal error:",
    error
  );

  setErrorMessage(
    "خطا در دریافت اطلاعات اکانت."
  );
}


}

// =========================================
// CLOSE MODAL
// =========================================

function closeModal() {
if (saving) {
return;
}


setShowModal(false);
resetForm();


}

// =========================================
// IMAGE SELECT
// =========================================

function handleImageChange(
event: ChangeEvent<HTMLInputElement>
) {
const files = Array.from(
event.target.files || []
);


if (files.length === 0) {
  return;
}

setSelectedImages(files);

const previews = files.map((file) =>
  URL.createObjectURL(file)
);

setImagePreviews(previews);

setMainImageIndex(0);


}

// =========================================
// DELETE EXISTING IMAGE
// =========================================

function deleteExistingImage(
index: number
) {
setExistingImages((current) =>
current.filter(
(_, imageIndex) =>
imageIndex !== index
)
);


setMainImageIndex(0);


}

// =========================================
// DELETE SELECTED IMAGE
// =========================================

function deleteSelectedImage(
index: number
) {
setSelectedImages((current) =>
current.filter(
(_, imageIndex) =>
imageIndex !== index
)
);


setImagePreviews((current) =>
  current.filter(
    (_, imageIndex) =>
      imageIndex !== index
  )
);

setMainImageIndex(0);


}

// =========================================
// SET MAIN IMAGE
// =========================================

function setMainImage(index: number) {
setMainImageIndex(index);
}

// =========================================
// VIDEO SELECT
// =========================================

function handleVideoChange(
event: ChangeEvent<HTMLInputElement>
) {
const file =
event.target.files?.[0];


if (!file) {
  return;
}

if (videoPreview) {
  URL.revokeObjectURL(videoPreview);
}

setSelectedVideo(file);
setVideoPreview(
  URL.createObjectURL(file)
);


}

// =========================================
// DELETE VIDEO
// =========================================

function deleteVideo() {
if (videoPreview) {
URL.revokeObjectURL(videoPreview);
}


setSelectedVideo(null);
setVideoPreview("");
setExistingVideoUrl("");


}

// =========================================
// UPLOAD FILE
// =========================================

async function uploadFile(
file: File,
folder: string
) {
const extension =
file.name.split(".").pop() ||
"bin";


const fileName = `${folder}/${Date.now()}-${Math.random()
  .toString(36)
  .slice(2)}.${extension}`;

const { error } =
  await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      upsert: false,
    });

if (error) {
  throw error;
}

const { data } =
  supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

return data.publicUrl;


}

// =========================================
// REMOVE STORAGE FILE
// =========================================

async function removeStorageFile(
url: string
) {
try {
const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;


  const index =
    url.indexOf(marker);

  if (index === -1) {
    return;
  }

  const path = url.slice(
    index + marker.length
  );

  if (!path) {
    return;
  }

  const { error } =
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

  if (error) {
    console.error(
      "removeStorageFile error:",
      error
    );
  }
} catch (error) {
  console.error(
    "removeStorageFile error:",
    error
  );
}


}

// =========================================
// SUBMIT
// =========================================

async function handleSubmit(
event: FormEvent<HTMLFormElement>
) {
event.preventDefault();


if (saving) {
  return;
}

setMessage("");
setErrorMessage("");

if (!selectedGame.trim()) {
  setErrorMessage(
    "لطفاً بازی را انتخاب کن."
  );
  return;
}

if (!title.trim()) {
  setErrorMessage(
    "لطفاً عنوان اکانت را وارد کن."
  );
  return;
}

const numericPrice =
  Number(price);

if (
  !Number.isFinite(
    numericPrice
  ) ||
  numericPrice <= 0
) {
  setErrorMessage(
    "قیمت واردشده معتبر نیست."
  );
  return;
}

if (!accountUsername.trim()) {
  setErrorMessage(
    "نام کاربری اکانت را وارد کن."
  );
  return;
}

if (!accountPassword.trim()) {
  setErrorMessage(
    "رمز عبور اکانت را وارد کن."
  );
  return;
}

try {
  setSaving(true);

  let imageUrls = [
    ...existingImages,
  ];

  let videoUrl =
    existingVideoUrl || null;

  // =====================================
  // UPLOAD NEW IMAGES
  // =====================================

  if (selectedImages.length > 0) {
    const uploadedImages: string[] =
      [];

    for (
      const file of selectedImages
    ) {
      const url =
        await uploadFile(
          file,
          "images"
        );

      uploadedImages.push(url);
    }

    imageUrls = [
      ...imageUrls,
      ...uploadedImages,
    ];
  }

  // =====================================
  // UPLOAD NEW VIDEO
  // =====================================

  if (selectedVideo) {
    if (existingVideoUrl) {
      await removeStorageFile(
        existingVideoUrl
      );
    }

    videoUrl =
      await uploadFile(
        selectedVideo,
        "videos"
      );
  }

  // =====================================
  // EDIT
  // =====================================

  if (editingId !== null) {
    const { error } =
      await supabase.rpc(
        "update_product_account",
        {
          p_product_id:
            editingId,

          p_game:
            selectedGame.trim(),

          p_title:
            title.trim(),

          p_description:
            description.trim() ||
            null,

          p_price:
            Math.round(
              numericPrice
            ),

          p_images:
            imageUrls,

          p_video_url:
            videoUrl,

          p_account_username:
            accountUsername.trim(),

          p_account_password:
            accountPassword.trim(),

          p_backup_password1:
            backupPassword1.trim() ||
            null,

          p_backup_password2:
            backupPassword2.trim() ||
            null,
        }
      );

    if (error) {
      throw error;
    }

    setMessage(
      "اکانت با موفقیت ویرایش شد."
    );
  }

  // =====================================
  // ADD
  // =====================================

  else {
    const { data, error } =
      await supabase.rpc(
        "create_product_account",
        {
          p_game:
            selectedGame.trim(),

          p_title:
            title.trim(),

          p_description:
            description.trim() ||
            null,

          p_price:
            Math.round(
              numericPrice
            ),

          p_images:
            imageUrls,

          p_video_url:
            videoUrl,

          p_account_username:
            accountUsername.trim(),

          p_account_password:
            accountPassword.trim(),

          p_backup_password1:
            backupPassword1.trim() ||
            null,

          p_backup_password2:
            backupPassword2.trim() ||
            null,
        }
      );

    if (error) {
      throw error;
    }

    /*
     * اگر تابع create_product_account
     * در پروژه وجود نداشته باشد، این بخش
     * ممکن است خطا بدهد.
     *
     * در صورت خطا متن خطا را در کنسول
     * و صفحه نمایش می‌دهیم.
     */

    console.log(
      "create_product_account result:",
      data
    );

    setMessage(
      "اکانت با موفقیت اضافه شد."
    );
  }

  await loadProducts();

  setTimeout(() => {
    setShowModal(false);
    resetForm();
  }, 700);
} catch (error) {
  console.error(
    "handleSubmit error:",
    error
  );

  setErrorMessage(
    error instanceof Error
      ? error.message
      : "خطا در ذخیره اکانت."
  );
} finally {
  setSaving(false);
}


}

// =========================================
// DELETE PRODUCT
// =========================================

async function deleteProduct(
product: Product
) {
const confirmed =
window.confirm(
`آیا مطمئنی می‌خواهی اکانت "${product.title}" حذف شود؟`
);


if (!confirmed) {
  return;
}

try {
  setMessage("");
  setErrorMessage("");

  /*
   * حذف از دیتابیس
   */
  const { error } =
    await supabase
      .from("Product")
      .delete()
      .eq("id", product.id);

  if (error) {
    throw error;
  }

  /*
   * حذف فایل‌های تصاویر
   */
  if (
    Array.isArray(
      product.images
    )
  ) {
    for (
      const image of product.images
    ) {
      await removeStorageFile(
        image
      );
    }
  }

  /*
   * حذف ویدیو
   */
  if (product.videoUrl) {
    await removeStorageFile(
      product.videoUrl
    );
  }

  setProducts((current) =>
    current.filter(
      (item) =>
        item.id !== product.id
    )
  );

  setMessage(
    "اکانت با موفقیت حذف شد."
  );
} catch (error) {
  console.error(
    "deleteProduct error:",
    error
  );

  setErrorMessage(
    error instanceof Error
      ? error.message
      : "خطا در حذف اکانت."
  );
}


}

// =========================================
// TOGGLE SOLD
// =========================================

async function toggleSold(
product: Product
) {
try {
setMessage("");
setErrorMessage("");


  const newValue =
    !product.isSold;

  const { error } =
    await supabase
      .from("Product")
      .update({
        isSold: newValue,
      })
      .eq("id", product.id);

  if (error) {
    throw error;
  }

  setProducts((current) =>
    current.map((item) =>
      item.id === product.id
        ? {
            ...item,
            isSold: newValue,
          }
        : item
    )
  );

  setMessage(
    newValue
      ? "اکانت به حالت فروخته‌شده تغییر کرد."
      : "اکانت دوباره موجود شد."
  );
} catch (error) {
  console.error(
    "toggleSold error:",
    error
  );

  setErrorMessage(
    error instanceof Error
      ? error.message
      : "خطا در تغییر وضعیت اکانت."
  );
}


}

// =========================================
// COUNTS
// =========================================

const availableCount =
products.filter(
(product) =>
!product.isSold
).length;

const soldCount =
products.filter(
(product) =>
product.isSold
).length;

// =========================================
// UI
// =========================================

return ( <main
   dir="rtl"
   className="min-h-screen bg-zinc-950 text-white"
 > <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">


    {/* ===================================
        HEADER
    =================================== */}

    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-black">
          پنل مدیریت
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          مدیریت اکانت‌ها، بازی‌ها و تراکنش‌ها
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/transactions"
            )
          }
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
        >
          مدیریت تراکنش‌ها
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/buyers"
            )
          }
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
        >
          خریداران
        </button>
      </div>
    </div>

    {/* ===================================
        MESSAGE
    =================================== */}

    {message && (
      <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-bold text-emerald-400">
        {message}
      </div>
    )}

    {errorMessage && (
      <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-400">
        {errorMessage}
      </div>
    )}

    {/* ===================================
        STATS
    =================================== */}

    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

      {/* TOTAL PRODUCTS */}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-zinc-400">
          کل اکانت‌ها
        </p>

        <p className="mt-2 text-3xl font-black">
          {products.length}
        </p>
      </div>

      {/* AVAILABLE */}

      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <p className="text-sm text-zinc-400">
          موجود
        </p>

        <p className="mt-2 text-3xl font-black text-emerald-400">
          {availableCount}
        </p>
      </div>

      {/* SOLD */}

      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-5">
        <p className="text-sm text-zinc-400">
          فروخته‌شده
        </p>

        <p className="mt-2 text-3xl font-black text-red-400">
          {soldCount}
        </p>
      </div>

      {/* GAMES */}

      <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-5">
        <p className="text-sm text-zinc-400">
          بازی‌ها
        </p>

        <p className="mt-2 text-3xl font-black text-blue-400">
          {games.length}
        </p>
      </div>

      {/* BUYERS */}

      <button
        type="button"
        onClick={() =>
          router.push(
            "/admin/buyers"
          )
        }
        className="rounded-3xl border border-white/10 bg-white/5 p-5 text-right transition hover:bg-white/10 active:scale-[0.99]"
      >
        <p className="text-sm text-zinc-400">
          خریداران
        </p>

        <p className="mt-2 text-3xl font-black">
          {purchaseCount}
        </p>
      </button>

      {/* TRANSACTIONS */}

      <button
        type="button"
        onClick={() => {
          router.push(
            "/admin/transactions"
          );
        }}
        className="relative rounded-3xl border border-white/10 bg-white/5 p-5 text-right transition hover:bg-white/10 active:scale-[0.99]"
      >
        {/* NEW TRANSACTION DOT */}

        {hasNewTransaction && (
          <span
            className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
            aria-label="تراکنش جدید"
          />
        )}

        <p className="text-sm text-zinc-400">
          تراکنش‌ها
        </p>

        <p className="mt-2 text-3xl font-black">
          {transactionCount}
        </p>

        {hasNewTransaction && (
          <p className="mt-1 text-xs font-bold text-red-400">
            تراکنش جدید
          </p>
        )}
      </button>
    </div>

    {/* ===================================
        PRODUCTS HEADER
    =================================== */}

    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-black">
          اکانت‌ها
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          مدیریت اکانت‌های قابل فروش
        </p>
      </div>

      <button
        type="button"
        onClick={openAddModal}
        className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
      >
        + افزودن اکانت
      </button>
    </div>

    {/* ===================================
        PRODUCTS LOADING
    =================================== */}

    {loadingProducts && (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
        در حال دریافت اکانت‌ها...
      </div>
    )}

    {/* ===================================
        PRODUCTS EMPTY
    =================================== */}

    {!loadingProducts &&
      products.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-lg font-bold">
            هنوز اکانتی ثبت نشده است.
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            از دکمه افزودن اکانت برای اضافه کردن محصول استفاده کن.
          </p>
        </div>
      )}

    {/* ===================================
        PRODUCTS LIST
    =================================== */}

    {!loadingProducts &&
      products.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

          {products.map(
            (product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                {/* IMAGE */}

                <div className="aspect-video bg-black/30">
                  {product.images &&
                  product.images.length >
                    0 ? (
                    <img
                      src={
                        product.images[0]
                      }
                      alt={
                        product.title
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                      بدون تصویر
                    </div>
                  )}
                </div>

                {/* CONTENT */}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">
                        {product.game}
                      </p>

                      <h3 className="mt-1 truncate text-lg font-black">
                        {product.title}
                      </h3>
                    </div>

                    {product.isSold ? (
                      <span className="shrink-0 rounded-xl bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400">
                        فروخته‌شده
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-xl bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                        موجود
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-xl font-black">
                    {formatPrice(
                      product.price
                    )}{" "}
                    تومان
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      ❤️{" "}
                      {product.likes}
                    </span>

                    <span>
                      #{product.id}
                    </span>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-5 grid grid-cols-2 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(
                          product
                        )
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
                    >
                      ویرایش
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleSold(
                          product
                        )
                      }
                      className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                        product.isSold
                          ? "bg-emerald-500 text-black hover:bg-emerald-400"
                          : "bg-yellow-500 text-black hover:bg-yellow-400"
                      }`}
                    >
                      {product.isSold
                        ? "موجود کردن"
                        : "فروخته شد"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteProduct(
                          product
                        )
                      }
                      className="col-span-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
                    >
                      حذف اکانت
                    </button>

                  </div>
                </div>
              </div>
            )
          )}

        </div>
      )}

    {/* ===================================
        MODAL
    =================================== */}

    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900">

          {/* MODAL HEADER */}

          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-900/95 px-5 py-4 backdrop-blur">
            <div>
              <h2 className="text-xl font-black">
                {editingId !== null
                  ? "ویرایش اکانت"
                  : "افزودن اکانت"}
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                اطلاعات اکانت و فایل‌های رسانه‌ای
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold transition hover:bg-white/10 disabled:opacity-50"
            >
              بستن
            </button>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-5"
          >

            {/* GAME */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                بازی
              </label>

              <select
                value={selectedGame}
                onChange={(event) =>
                  setSelectedGame(
                    event.target.value
                  )
                }
                disabled={
                  loadingGames ||
                  saving
                }
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
              >
                <option value="">
                  انتخاب بازی
                </option>

                {games.map(
                  (game) => (
                    <option
                      key={game.id}
                      value={
                        game.name
                      }
                    >
                      {game.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* TITLE */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                عنوان
              </label>

              <input
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                disabled={saving}
                placeholder="مثلاً اکانت حرفه‌ای FC 26"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                توضیحات
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                disabled={saving}
                rows={4}
                placeholder="توضیحات اکانت..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* PRICE */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                قیمت
              </label>

              <input
                type="number"
                min="1"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target.value
                  )
                }
                disabled={saving}
                placeholder="قیمت به تومان"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* ACCOUNT USERNAME */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                نام کاربری اکانت
              </label>

              <input
                value={
                  accountUsername
                }
                onChange={(event) =>
                  setAccountUsername(
                    event.target.value
                  )
                }
                disabled={saving}
                placeholder="Username / Email"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* ACCOUNT PASSWORD */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                رمز عبور اکانت
              </label>

              <input
                value={
                  accountPassword
                }
                onChange={(event) =>
                  setAccountPassword(
                    event.target.value
                  )
                }
                disabled={saving}
                placeholder="Password"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* BACKUP PASSWORD 1 */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                رمز پشتیبان ۱
              </label>

              <input
                value={
                  backupPassword1
                }
                onChange={(event) =>
                  setBackupPassword1(
                    event.target.value
                  )
                }
                disabled={saving}
                placeholder="اختیاری"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* BACKUP PASSWORD 2 */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                رمز پشتیبان ۲
              </label>

              <input
                value={
                  backupPassword2
                }
                onChange={(event) =>
                  setBackupPassword2(
                    event.target.value
                  )
                }
                disabled={saving}
                placeholder="اختیاری"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* IMAGES */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                تصاویر
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImageChange
                }
                disabled={saving}
                className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:font-bold file:text-black"
              />

              {/* EXISTING IMAGES */}

              {existingImages.length >
                0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs text-zinc-500">
                    تصاویر فعلی
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {existingImages.map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          key={`${image}-${index}`}
                          className="relative overflow-hidden rounded-2xl border border-white/10"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setMainImage(
                                index
                              )
                            }
                            className={`absolute left-2 top-2 z-10 rounded-lg px-2 py-1 text-xs font-bold ${
                              mainImageIndex ===
                              index
                                ? "bg-white text-black"
                                : "bg-black/70 text-white"
                            }`}
                          >
                            {mainImageIndex ===
                            index
                              ? "اصلی"
                              : "انتخاب"}
                          </button>

                          <img
                            src={image}
                            alt={`تصویر ${index + 1}`}
                            className="aspect-square w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              deleteExistingImage(
                                index
                              )
                            }
                            className="absolute bottom-2 right-2 rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white"
                          >
                            حذف
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* NEW IMAGES */}

              {imagePreviews.length >
                0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs text-zinc-500">
                    تصاویر جدید
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {imagePreviews.map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          key={`${image}-${index}`}
                          className="relative overflow-hidden rounded-2xl border border-white/10"
                        >
                          <img
                            src={image}
                            alt={`تصویر جدید ${index + 1}`}
                            className="aspect-square w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              deleteSelectedImage(
                                index
                              )
                            }
                            className="absolute bottom-2 right-2 rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white"
                          >
                            حذف
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* VIDEO */}

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-300">
                ویدیو
              </label>

              <input
                type="file"
                accept="video/*"
                onChange={
                  handleVideoChange
                }
                disabled={saving}
                className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:font-bold file:text-black"
              />

              {(videoPreview ||
                existingVideoUrl) && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <video
                    src={
                      videoPreview ||
                      existingVideoUrl
                    }
                    controls
                    className="max-h-80 w-full bg-black"
                  />

                  <button
                    type="button"
                    onClick={
                      deleteVideo
                    }
                    className="w-full bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
                  >
                    حذف ویدیو
                  </button>
                </div>
              )}
            </div>

            {/* FORM ACTIONS */}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-2xl bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "در حال ذخیره..."
                  : editingId !== null
                  ? "ذخیره تغییرات"
                  : "افزودن اکانت"}
              </button>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={saving}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10 disabled:opacity-50"
              >
                انصراف
              </button>

            </div>
          </form>
        </div>
      </div>
    )}
  </div>
</main>


);
}
