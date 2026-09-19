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
};

type FullProduct = Product & {
  accountUsername: string;
  accountPassword: string;
  backupPassword1: string | null;
  backupPassword2: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [purchaseCount, setPurchaseCount] = useState(0);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [loadingGames, setLoadingGames] =
    useState(true);

  const [loadingEdit, setLoadingEdit] =
    useState(false);

  const [message, setMessage] = useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [game, setGame] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [price, setPrice] = useState("");
  const [accountUsername, setAccountUsername] =
    useState("");
  const [accountPassword, setAccountPassword] =
    useState("");
  const [backupPassword1, setBackupPassword1] =
    useState("");
  const [backupPassword2, setBackupPassword2] =
    useState("");

  const [selectedImages, setSelectedImages] =
    useState<File[]>([]);

  const [selectedVideo, setSelectedVideo] =
    useState<File | null>(null);

  const [uploadedImages, setUploadedImages] =
    useState<string[]>([]);

  const [uploadedVideo, setUploadedVideo] =
    useState("");

  // =========================================
  // IMAGE STATES
  // =========================================

  const [mainImageIndex, setMainImageIndex] =
    useState(0);

  const [selectedImagePreviews, setSelectedImagePreviews] =
    useState<string[]>([]);

  // =========================================
  // VIDEO PREVIEW
  // =========================================

  const [selectedVideoPreview, setSelectedVideoPreview] =
    useState("");

  const [saving, setSaving] = useState(false);

  // =========================================
  // CREATE PREVIEWS FOR NEW IMAGES
  // =========================================

  useEffect(() => {
    const urls = selectedImages.map((file) =>
      URL.createObjectURL(file)
    );

    setSelectedImagePreviews(urls);

    return () => {
      urls.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [selectedImages]);

  // =========================================
  // CREATE PREVIEW FOR NEW VIDEO
  // =========================================

  useEffect(() => {
    if (!selectedVideo) {
      setSelectedVideoPreview("");
      return;
    }

    const url =
      URL.createObjectURL(selectedVideo);

    setSelectedVideoPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedVideo]);

  // =========================================
  // LOAD GAMES
  // =========================================

  async function loadGames() {
    setLoadingGames(true);

    const { data, error } = await supabase
      .from("Game")
      .select("*")
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

  // =========================================
  // LOAD PRODUCTS
  // =========================================

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

  // =========================================
  // LOAD PURCHASE COUNT
  // =========================================

 async function loadPurchaseCount() {
  const { data, error } = await supabase.rpc(
    "get_admin_purchases"
  );

  if (error) {
    console.error(
      "get_admin_purchases error:",
      error
    );
    return;
  }

  setPurchaseCount(Array.isArray(data) ? data.length : 0);
}

  // =========================================
  // LOAD ALL DATA
  // =========================================

  useEffect(() => {
    loadGames();
    loadProducts();
    loadPurchaseCount();
  }, []);

  // =========================================
  // RESET ACCOUNT FORM
  // =========================================

  function resetForm() {
    setGame(
      games.find((item) => item.active)?.name ||
        ""
    );

    setTitle("");
    setDescription("");
    setPrice("");
    setAccountUsername("");
    setAccountPassword("");
    setBackupPassword1("");
    setBackupPassword2("");

    setSelectedImages([]);
    setSelectedVideo(null);

    setUploadedImages([]);
    setUploadedVideo("");

    setMainImageIndex(0);

    setSelectedVideoPreview("");

    setEditingProduct(null);
  }

  // =========================================
  // OPEN ADD MODAL
  // =========================================

  function openAddModal() {
    resetForm();

    setShowAddModal(true);
    setMessage("");
  }

  // =========================================
  // OPEN EDIT MODAL
  // =========================================

  async function openEditModal(product: Product) {
    setLoadingEdit(true);
    setMessage("");

    const { data, error } = await supabase.rpc(
      "get_product_account",
      {
        p_id: product.id,
      }
    );

    if (error) {
      console.error(error);

      setMessage(
        `خطا در دریافت اطلاعات اکانت: ${error.message}`
      );

      setLoadingEdit(false);
      return;
    }

    const fullProduct =
      Array.isArray(data)
        ? (data[0] as FullProduct | undefined)
        : (data as FullProduct | null);

    if (!fullProduct) {
      setMessage(
        "اطلاعات کامل اکانت پیدا نشد."
      );

      setLoadingEdit(false);
      return;
    }

    setEditingProduct(product);

    setGame(fullProduct.game);
    setTitle(fullProduct.title);

    setDescription(
      fullProduct.description || ""
    );

    setPrice(String(fullProduct.price));

    setAccountUsername(
      fullProduct.accountUsername || ""
    );

    setAccountPassword(
      fullProduct.accountPassword || ""
    );
    setBackupPassword1(
      fullProduct.backupPassword1 || ""
    );
    setBackupPassword2(
      fullProduct.backupPassword2 || ""
    );

    setSelectedImages([]);
    setSelectedVideo(null);

    setUploadedImages(
      fullProduct.images || []
    );

    setUploadedVideo(
      fullProduct.videoUrl || ""
    );

    setMainImageIndex(0);
    setSelectedVideoPreview("");

    setShowAddModal(true);
    setLoadingEdit(false);
  }

  // =========================================
  // CLOSE ACCOUNT MODAL
  // =========================================

  function closeAddModal() {
    if (saving) {
      return;
    }

    setShowAddModal(false);
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

    setSelectedImages((current) => [
      ...current,
      ...files,
    ]);

    if (
      uploadedImages.length === 0 &&
      selectedImages.length === 0
    ) {
      setMainImageIndex(0);
    }

    event.target.value = "";
  }

  // =========================================
  // DELETE UPLOADED IMAGE
  // =========================================

  async function deleteUploadedImage(
    index: number
  ) {
    const image = uploadedImages[index];

    if (!image) {
      return;
    }

    const confirmed = window.confirm(
      "آیا می‌خواهی این عکس حذف شود؟"
    );

    if (!confirmed) {
      return;
    }

    await removeStorageFile(image);

    setUploadedImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );

    setMainImageIndex((current) => {
      if (index < current) {
        return current - 1;
      }

      if (index === current) {
        return 0;
      }

      return current;
    });
  }

  // =========================================
  // DELETE SELECTED NEW IMAGE
  // =========================================

  function deleteSelectedImage(
    index: number
  ) {
    const combinedIndex =
      uploadedImages.length + index;

    setSelectedImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );

    setMainImageIndex((current) => {
      if (combinedIndex < current) {
        return current - 1;
      }

      if (combinedIndex === current) {
        return 0;
      }

      return current;
    });
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
      event.target.files?.[0] || null;

    setSelectedVideo(file);

    event.target.value = "";
  }

  // =========================================
  // DELETE CURRENT VIDEO
  // =========================================

  function deleteUploadedVideo() {
    if (!uploadedVideo) {
      return;
    }

    const confirmed = window.confirm(
      "آیا می‌خواهی ویدیوی فعلی حذف شود؟"
    );

    if (!confirmed) {
      return;
    }

    setUploadedVideo("");
  }

  // =========================================
  // DELETE NEW VIDEO
  // =========================================

  function deleteSelectedVideo() {
    setSelectedVideo(null);
    setSelectedVideoPreview("");
  }

  // =========================================
  // UPLOAD IMAGE
  // =========================================

  async function uploadImage(file: File) {
    const extension =
      file.name.split(".").pop() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const path = `images/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // =========================================
  // UPLOAD VIDEO
  // =========================================

  async function uploadVideo(file: File) {
    const extension =
      file.name.split(".").pop() || "mp4";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const path = `videos/${fileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // =========================================
  // DELETE STORAGE FILE
  // =========================================

  async function removeStorageFile(
    publicUrl: string
  ) {
    try {
      const marker =
        `/storage/v1/object/public/${STORAGE_BUCKET}/`;

      const index = publicUrl.indexOf(marker);

      if (index === -1) {
        return;
      }

      const path = publicUrl.slice(
        index + marker.length
      );

      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);
    } catch (error) {
      console.error(error);
    }
  }

  // =========================================
  // SAVE ACCOUNT
  // =========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!game) {
      setMessage("یک بازی انتخاب کن.");
      return;
    }

    if (!title.trim()) {
      setMessage("عنوان اکانت را وارد کن.");
      return;
    }

    const numericPrice = Number(
      price.replace(/,/g, "")
    );

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      setMessage("قیمت واردشده صحیح نیست.");
      return;
    }

    if (!accountUsername.trim()) {
      setMessage(
        "جیمیل یا نام کاربری اکانت را وارد کن."
      );
      return;
    }

    if (!accountPassword.trim()) {
      setMessage(
        "رمز عبور اکانت را وارد کن."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      // =====================================
      // EDIT
      // =====================================

      if (editingProduct) {
        let finalImages =
          uploadedImages.length > 0
            ? [...uploadedImages]
            : [];

        let finalVideo =
          uploadedVideo || null;

        // ===================================
        // UPLOAD NEW IMAGES
        // ===================================

        if (selectedImages.length > 0) {
          const newImages: string[] = [];

          for (const file of selectedImages) {
            const url =
              await uploadImage(file);

            newImages.push(url);
          }

          finalImages = [
            ...finalImages,
            ...newImages,
          ];
        }

        // ===================================
        // UPLOAD NEW VIDEO
        // ===================================

        if (selectedVideo) {
          finalVideo =
            await uploadVideo(selectedVideo);
        }

        // ===================================
        // MOVE MAIN IMAGE TO FIRST POSITION
        // ===================================

        if (finalImages.length > 0) {
          const safeMainIndex = Math.min(
            Math.max(mainImageIndex, 0),
            finalImages.length - 1
          );

          const mainImage =
            finalImages[safeMainIndex];

          finalImages = [
            mainImage,
            ...finalImages.filter(
              (_, index) =>
                index !== safeMainIndex
            ),
          ];
        }

        // ===================================
        // UPDATE DATABASE
        // ===================================

        const { data, error } =
          await supabase.rpc(
            "update_product_account",
            {
              p_id: editingProduct.id,
              p_game: game,
              p_title: title.trim(),
              p_description:
                description.trim()
                  ? description.trim()
                  : null,
              p_price: numericPrice,

              p_account_username:
                accountUsername.trim(),

              p_account_password:
                accountPassword,

              p_backup_password1: backupPassword1,
              p_backup_password2: backupPassword2,

              p_images:
                finalImages.length > 0
                  ? finalImages
                  : null,

              p_video_url:
                finalVideo || null,
            }
          );

        if (error) {
          console.error(error);

          setMessage(
            `خطا در ویرایش اکانت: ${error.message}`
          );

          setSaving(false);
          return;
        }

        if (data !== true) {
          setMessage(
            "اکانت پیدا نشد یا تغییرات ذخیره نشد."
          );

          setSaving(false);
          return;
        }

        // ===================================
        // REMOVE OLD REMOVED IMAGES
        // ===================================

        const oldImages =
          editingProduct.images || [];

        const removedImages =
          oldImages.filter(
            (url) =>
              !finalImages.includes(url)
          );

        for (const url of removedImages) {
          await removeStorageFile(url);
        }

        // ===================================
        // REMOVE OLD VIDEO
        // ===================================

        if (
          editingProduct.videoUrl &&
          editingProduct.videoUrl !== finalVideo
        ) {
          await removeStorageFile(
            editingProduct.videoUrl
          );
        }

        setMessage(
          "اکانت با موفقیت ویرایش شد."
        );

        setShowAddModal(false);
        resetForm();

        await loadProducts();

        setSaving(false);
        return;
      }

      // =====================================
      // ADD NEW ACCOUNT
      // =====================================

      const finalImages: string[] = [];

      // ===================================
      // UPLOAD IMAGES
      // ===================================

      for (const file of selectedImages) {
        const url =
          await uploadImage(file);

        finalImages.push(url);
      }

      // ===================================
      // MOVE MAIN IMAGE TO FIRST POSITION
      // ===================================

      if (finalImages.length > 0) {
        const safeMainIndex = Math.min(
          Math.max(mainImageIndex, 0),
          finalImages.length - 1
        );

        if (safeMainIndex !== 0) {
          const mainImage =
            finalImages[safeMainIndex];

          finalImages.splice(
            safeMainIndex,
            1
          );

          finalImages.unshift(mainImage);
        }
      }

      // ===================================
      // UPLOAD VIDEO
      // ===================================

      let finalVideo: string | null = null;

      if (selectedVideo) {
        finalVideo =
          await uploadVideo(selectedVideo);
      }

      // ===================================
      // INSERT PRODUCT
      // ===================================

      const { error } = await supabase
        .from("Product")
        .insert({
          game,
          title: title.trim(),
          description:
            description.trim()
              ? description.trim()
              : null,
          price: numericPrice,

          images:
            finalImages.length > 0
              ? finalImages
              : null,

          videoUrl: finalVideo,

          accountUsername:
            accountUsername.trim(),

          accountPassword:
            accountPassword,

          backupPassword1,
          backupPassword2,

          isSold: false,
          likes: 0,
        });

      if (error) {
        console.error(error);

        setMessage(
          `خطا در ثبت اکانت: ${error.message}`
        );

        setSaving(false);
        return;
      }

      setMessage(
        "اکانت با موفقیت ثبت شد."
      );

      setShowAddModal(false);
      resetForm();

      await loadProducts();
    } catch (error) {
      console.error(error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "خطای نامشخص";

      setMessage(
        `خطا: ${errorMessage}`
      );
    }

    setSaving(false);
  }

  // =========================================
  // DELETE PRODUCT
  // =========================================

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

    for (const image of product.images || []) {
      await removeStorageFile(image);
    }

    if (product.videoUrl) {
      await removeStorageFile(
        product.videoUrl
      );
    }

    setMessage(
      "اکانت با موفقیت حذف شد."
    );
  }

  // =========================================
  // TOGGLE SOLD
  // =========================================

  async function toggleSold(
    product: Product
  ) {
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

  // =========================================
  // FORMAT PRICE
  // =========================================

  function formatPrice(price: number) {
    return new Intl.NumberFormat(
      "fa-IR"
    ).format(price);
  }

  const activeGames = games.filter(
    (item) => item.active
  );

  const soldCount = products.filter(
    (item) => item.isSold
  ).length;

  const availableCount =
    products.length - soldCount;

  // =========================================
  // UI
  // =========================================

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
              پنل مدیریت
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              مدیریت اکانت‌های بازی و بازی‌ها
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={openAddModal}
              className="rounded-2xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200"
            >
              + افزودن اکانت
            </button>

          </div>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm">
            {message}
          </div>
        )}

        {/* STATS */}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/accounts?filter=all"
              )
            }
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-right transition hover:bg-white/10 active:scale-[0.99]"
          >
            <p className="text-sm text-zinc-400">
              کل اکانت‌ها
            </p>

            <p className="mt-2 text-3xl font-black">
              {products.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/accounts?filter=available"
              )
            }
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-right transition hover:bg-white/10 active:scale-[0.99]"
          >
            <p className="text-sm text-zinc-400">
              اکانت‌های موجود
            </p>

            <p className="mt-2 text-3xl font-black">
              {availableCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/accounts?filter=sold"
              )
            }
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-right transition hover:bg-white/10 active:scale-[0.99]"
          >
            <p className="text-sm text-zinc-400">
              فروخته‌شده
            </p>

            <p className="mt-2 text-3xl font-black">
              {soldCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/games")
            }
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-right transition hover:bg-white/10 active:scale-[0.99]"
          >
            <p className="text-sm text-zinc-400">
              بازی‌ها
            </p>

            <p className="mt-2 text-3xl font-black">
              {games.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/buyers")
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

        </div>

        {/* PRODUCTS */}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">
              اکانت‌ها
            </h2>

            <button
              onClick={loadProducts}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              ↻ بروزرسانی
            </button>
          </div>

          {loadingProducts ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
              در حال دریافت اکانت‌ها...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-zinc-400">
              هنوز هیچ اکانتی ثبت نشده است.
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
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
                        onClick={() =>
                          openEditModal(product)
                        }
                        disabled={loadingEdit}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/10 disabled:opacity-50"
                      >
                        {loadingEdit
                          ? "در حال دریافت..."
                          : "ویرایش"}
                      </button>

                      <button
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
                        onClick={() =>
                          deleteProduct(product)
                        }
                        className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10"
                      >
                        حذف
                      </button>

                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ===================================== */}
      {/* ACCOUNT MODAL */}
      {/* ===================================== */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101014] p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-black">
                  {editingProduct
                    ? "ویرایش اکانت"
                    : "افزودن اکانت"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  اطلاعات اکانت را وارد کن
                </p>
              </div>

              <button
                onClick={closeAddModal}
                className="rounded-xl px-3 py-2 text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* GAME */}

              <div>
                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-bold">
                    بازی
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/games"
                      )
                    }
                    className="text-xs font-bold text-blue-400 hover:text-blue-300"
                  >
                    + افزودن بازی
                  </button>

                </div>

                <select
                  value={game}
                  onChange={(event) =>
                    setGame(
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                >
                  <option value="">
                    انتخاب بازی
                  </option>

                  {activeGames.map(
                    (gameItem) => (
                      <option
                        key={gameItem.id}
                        value={gameItem.name}
                      >
                        {gameItem.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  عنوان اکانت
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="مثلاً اکانت لول بالا"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  توضیحات
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="توضیحات اکانت..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              {/* PRICE */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  قیمت
                </label>

                <input
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      event.target.value
                    )
                  }
                  inputMode="numeric"
                  placeholder="مثلاً 2500000"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              {/* USERNAME / EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  جیمیل / نام کاربری اکانت
                </label>

                <input
                  value={accountUsername}
                  onChange={(event) =>
                    setAccountUsername(
                      event.target.value
                    )
                  }
                  type="text"
                  name="game-account-username"
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect="off"
                  placeholder="جیمیل یا نام کاربری اکانت"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  رمز عبور اکانت
                </label>

                <input
                  value={accountPassword}
                  onChange={(event) =>
                    setAccountPassword(
                      event.target.value
                    )
                  }
                  type="text"
                  name="game-account-password"
                  autoComplete="new-password"
                  spellCheck={false}
                  autoCorrect="off"
                  placeholder="رمز عبور اکانت"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
                />
              </div>

              {/* BACKUP PASSWORDS */}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    رمز بکاپ اول
                  </label>
                  <input
                    value={backupPassword1}
                    onChange={(event) =>
                      setBackupPassword1(event.target.value)
                    }
                    type="text"
                    autoComplete="off"
                    placeholder="رمز بکاپ اول"
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    رمز بکاپ دوم
                  </label>
                  <input
                    value={backupPassword2}
                    onChange={(event) =>
                      setBackupPassword2(event.target.value)
                    }
                    type="text"
                    autoComplete="off"
                    placeholder="رمز بکاپ دوم"
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* IMAGES */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  تصاویر اکانت
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300"
                />

                {(uploadedImages.length > 0 ||
                  selectedImages.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                    {uploadedImages.map(
                      (image, index) => {
                        const isMain =
                          mainImageIndex ===
                          index;

                        return (
                          <div
                            key={`${image}-${index}`}
                            className={`relative overflow-hidden rounded-2xl border-2 ${
                              isMain
                                ? "border-yellow-400"
                                : "border-white/10"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`تصویر ${index + 1}`}
                              className="aspect-square w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                deleteUploadedImage(
                                  index
                                )
                              }
                              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-lg font-black text-white shadow-lg transition hover:bg-red-600"
                            >
                              ×
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setMainImage(
                                  index
                                )
                              }
                              className={`absolute bottom-2 left-2 rounded-xl px-3 py-1.5 text-xs font-black shadow-lg ${
                                isMain
                                  ? "bg-yellow-400 text-black"
                                  : "bg-black/70 text-white hover:bg-black/90"
                              }`}
                            >
                              {isMain
                                ? "⭐ اصلی"
                                : "☆ اصلی"}
                            </button>
                          </div>
                        );
                      }
                    )}

                    {selectedImagePreviews.map(
                      (preview, index) => {
                        const combinedIndex =
                          uploadedImages.length +
                          index;

                        const isMain =
                          mainImageIndex ===
                          combinedIndex;

                        return (
                          <div
                            key={`${preview}-${index}`}
                            className={`relative overflow-hidden rounded-2xl border-2 ${
                              isMain
                                ? "border-yellow-400"
                                : "border-white/10"
                            }`}
                          >
                            <img
                              src={preview}
                              alt={`تصویر جدید ${
                                index + 1
                              }`}
                              className="aspect-square w-full object-cover"
                            />

                            <div className="absolute left-2 top-2 z-10 rounded-lg bg-blue-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
                              جدید
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                deleteSelectedImage(
                                  index
                                )
                              }
                              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-lg font-black text-white shadow-lg transition hover:bg-red-600"
                            >
                              ×
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setMainImage(
                                  combinedIndex
                                )
                              }
                              className={`absolute bottom-2 left-2 rounded-xl px-3 py-1.5 text-xs font-black shadow-lg ${
                                isMain
                                  ? "bg-yellow-400 text-black"
                                  : "bg-black/70 text-white hover:bg-black/90"
                              }`}
                            >
                              {isMain
                                ? "⭐ اصلی"
                                : "☆ اصلی"}
                            </button>
                          </div>
                        );
                      }
                    )}

                  </div>
                )}

                {(uploadedImages.length > 0 ||
                  selectedImages.length > 0) && (
                  <p className="mt-3 text-xs text-zinc-500">
                    روی «☆ اصلی» بزن تا آن عکس
                    به‌عنوان عکس اصلی انتخاب شود.
                    عکس اصلی با ⭐ مشخص می‌شود.
                  </p>
                )}

                {selectedImages.length > 0 && (
                  <p className="mt-2 text-xs text-blue-400">
                    {selectedImages.length} تصویر
                    جدید انتخاب شده
                  </p>
                )}
              </div>

              {/* VIDEO */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  ویدیو
                </label>

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="block w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300"
                />

                {uploadedVideo && (
                  <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">

                    <video
                      src={uploadedVideo}
                      controls
                      playsInline
                      className="max-h-80 w-full object-contain"
                    />

                    <div className="absolute left-3 top-3 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                      ویدیوی فعلی
                    </div>

                    <button
                      type="button"
                      onClick={
                        deleteUploadedVideo
                      }
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-xl font-black text-white shadow-lg transition hover:bg-red-600"
                    >
                      ×
                    </button>

                  </div>
                )}

                {selectedVideo &&
                  selectedVideoPreview && (
                    <div className="relative mt-4 overflow-hidden rounded-2xl border-2 border-blue-500/50 bg-black">

                      <video
                        src={selectedVideoPreview}
                        controls
                        playsInline
                        className="max-h-80 w-full object-contain"
                      />

                      <div className="absolute left-3 top-3 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                        ویدیوی جدید
                      </div>

                      <button
                        type="button"
                        onClick={
                          deleteSelectedVideo
                        }
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-xl font-black text-white shadow-lg transition hover:bg-red-600"
                      >
                        ×
                      </button>

                      <div className="border-t border-white/10 bg-black/50 px-3 py-2 text-xs text-zinc-400">
                        {selectedVideo.name}
                      </div>

                    </div>
                  )}

                {!uploadedVideo &&
                  !selectedVideo && (
                    <p className="mt-3 text-xs text-zinc-500">
                      هنوز ویدیویی انتخاب نشده است.
                    </p>
                  )}

                {uploadedVideo &&
                  selectedVideo && (
                    <p className="mt-3 text-xs text-yellow-400">
                      با ذخیره تغییرات، ویدیوی جدید
                      جایگزین ویدیوی فعلی می‌شود.
                    </p>
                  )}
              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={saving}
                  className="flex-1 rounded-2xl border border-white/10 px-5 py-3 font-bold hover:bg-white/5 disabled:opacity-50"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-white px-5 py-3 font-bold text-black hover:bg-zinc-200 disabled:opacity-50"
                >
                  {saving
                    ? "در حال ذخیره..."
                    : editingProduct
                    ? "ذخیره تغییرات"
                    : "ثبت اکانت"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
}