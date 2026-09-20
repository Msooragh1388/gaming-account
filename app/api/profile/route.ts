import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

async function getProfileByToken(token: string) {
  const { data, error } = await supabase.rpc(
    "get_my_profile",
    {
      p_token: token,
    }
  );

  if (error) {
    console.error("get_my_profile error:", error);
    return {
      ok: false,
      error: error.message,
      data: null,
    };
  }

  if (!data?.success) {
    return {
      ok: false,
      error:
        data?.error ||
        "دریافت اطلاعات حساب ناموفق بود.",
      data: null,
    };
  }

  return {
    ok: true,
    error: null,
    data,
  };
}

/* =========================
   دریافت پروفایل
========================= */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body.token ?? "").trim();
    const action = String(body.action ?? "").trim();

    if (!token) {
      return jsonError(
        "نشست کاربر معتبر نیست.",
        401
      );
    }

    /*
      صفحه پروفایل فعلی برای دریافت اطلاعات
      فقط token می‌فرستد و action نمی‌فرستد.
      بنابراین اگر action خالی باشد، دریافت پروفایل انجام می‌شود.
    */
    if (!action || action === "get") {
      const result = await getProfileByToken(token);

      if (!result.ok) {
        return jsonError(
          result.error || "دریافت اطلاعات ناموفق بود.",
          400
        );
      }

      return NextResponse.json(result.data);
    }

    /* =========================
       ذخیره اطلاعات شخصی
    ========================= */

    if (action === "save_profile") {
      const firstName = String(
        body.firstName ?? ""
      ).trim();

      const lastName = String(
        body.lastName ?? ""
      ).trim();

      const mobile = String(
        body.mobile ?? ""
      ).trim();

      if (!firstName || !lastName || !mobile) {
        return jsonError(
          "نام، نام خانوادگی و شماره موبایل را کامل وارد کنید."
        );
      }

      const { data, error } =
        await supabase.rpc("save_my_profile", {
          p_token: token,
          p_first_name: firstName,
          p_last_name: lastName,
          p_mobile: mobile,
        });

      if (error) {
        console.error(
          "save_my_profile error:",
          error
        );

        return jsonError(error.message);
      }

      return NextResponse.json(data);
    }

    /* =========================
       اضافه کردن یک کارت
    ========================= */

    if (action === "add_card") {
      const cardNumber = String(
        body.cardNumber ?? ""
      )
        .replace(/\s/g, "")
        .trim();

      const ownerName = String(
        body.ownerName ?? ""
      ).trim();

      if (!cardNumber || !ownerName) {
        return jsonError(
          "شماره کارت و نام مالک کارت را وارد کنید."
        );
      }

      if (!/^\d{16}$/.test(cardNumber)) {
        return jsonError(
          "شماره کارت باید دقیقاً ۱۶ رقم باشد."
        );
      }

      const { data, error } =
        await supabase.rpc("add_my_bank_card", {
          p_token: token,
          p_card_number: cardNumber,
          p_owner_name: ownerName,
        });

      if (error) {
        console.error(
          "add_my_bank_card error:",
          error
        );

        return jsonError(error.message);
      }

      return NextResponse.json(data);
    }

    /* =========================
       حذف یک کارت
    ========================= */

    if (action === "delete_card") {
      const cardId = Number(body.cardId);

      if (
        !Number.isInteger(cardId) ||
        cardId <= 0
      ) {
        return jsonError(
          "شناسه کارت معتبر نیست."
        );
      }

      const { data, error } =
        await supabase.rpc(
          "delete_my_bank_card",
          {
            p_token: token,
            p_card_id: cardId,
          }
        );

      if (error) {
        console.error(
          "delete_my_bank_card error:",
          error
        );

        return jsonError(error.message);
      }

      return NextResponse.json(data);
    }

    return jsonError("عملیات نامعتبر است.");
  } catch (error) {
    console.error(
      "Profile POST API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "خطایی در ارتباط با اطلاعات حساب رخ داد.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   ذخیره کامل اطلاعات پروفایل
========================= */

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const token = String(body.token ?? "").trim();

    if (!token) {
      return jsonError(
        "نشست کاربر معتبر نیست.",
        401
      );
    }

    const firstName = String(
      body.firstName ?? ""
    ).trim();

    const lastName = String(
      body.lastName ?? ""
    ).trim();

    const mobile = String(
      body.mobile ?? ""
    ).trim();

    const cards = Array.isArray(body.cards)
      ? body.cards
      : [];

    if (!firstName || !lastName || !mobile) {
      return jsonError(
        "نام، نام خانوادگی و شماره موبایل را کامل وارد کنید."
      );
    }

    /* =========================
       بررسی کارت‌ها
    ========================= */

    const cleanCards = cards.map(
      (card: any) => ({
        cardNumber: String(
          card?.cardNumber ?? ""
        )
          .replace(/\s/g, "")
          .trim(),

        ownerName: String(
          card?.ownerName ?? ""
        ).trim(),
      })
    );

    for (const card of cleanCards) {
      if (
        !card.cardNumber ||
        !card.ownerName
      ) {
        return jsonError(
          "شماره کارت و نام مالک همه کارت‌ها را کامل وارد کنید."
        );
      }

      if (!/^\d{16}$/.test(card.cardNumber)) {
        return jsonError(
          "شماره کارت باید دقیقاً ۱۶ رقم باشد."
        );
      }
    }

    /* =========================
       ذخیره اطلاعات شخصی
    ========================= */

    const { data: profileData, error: profileError } =
      await supabase.rpc("save_my_profile", {
        p_token: token,
        p_first_name: firstName,
        p_last_name: lastName,
        p_mobile: mobile,
      });

    if (profileError) {
      console.error(
        "save_my_profile error:",
        profileError
      );

      return jsonError(profileError.message);
    }

    if (!profileData?.success) {
      return jsonError(
        profileData?.error ||
          "ذخیره اطلاعات شخصی ناموفق بود."
      );
    }

    /* =========================
       دریافت کارت‌های فعلی
    ========================= */

    const currentProfile =
      await getProfileByToken(token);

    if (!currentProfile.ok) {
      return jsonError(
        currentProfile.error ||
          "دریافت کارت‌های فعلی ناموفق بود."
      );
    }

    const existingCards = Array.isArray(
      currentProfile.data?.cards
    )
      ? currentProfile.data.cards
      : [];

    /* =========================
       حذف کارت‌های قبلی
    ========================= */

    for (const card of existingCards) {
      const cardId = Number(card?.id);

      if (
        Number.isInteger(cardId) &&
        cardId > 0
      ) {
        const { data, error } =
          await supabase.rpc(
            "delete_my_bank_card",
            {
              p_token: token,
              p_card_id: cardId,
            }
          );

        if (error) {
          console.error(
            "delete_my_bank_card error:",
            error
          );

          return jsonError(error.message);
        }

        if (!data?.success) {
          return jsonError(
            data?.error ||
              "حذف کارت قبلی ناموفق بود."
          );
        }
      }
    }

    /* =========================
       اضافه کردن کارت‌های جدید
    ========================= */

    for (const card of cleanCards) {
      const { data, error } =
        await supabase.rpc(
          "add_my_bank_card",
          {
            p_token: token,
            p_card_number: card.cardNumber,
            p_owner_name: card.ownerName,
          }
        );

      if (error) {
        console.error(
          "add_my_bank_card error:",
          error
        );

        return jsonError(error.message);
      }

      if (!data?.success) {
        return jsonError(
          data?.error ||
            "ذخیره کارت بانکی ناموفق بود."
        );
      }
    }

    /* =========================
       دریافت اطلاعات نهایی
    ========================= */

    const finalProfile =
      await getProfileByToken(token);

    if (!finalProfile.ok) {
      return jsonError(
        finalProfile.error ||
          "دریافت اطلاعات نهایی ناموفق بود."
      );
    }

    return NextResponse.json({
      success: true,
      profile:
        finalProfile.data?.profile || null,
      cards:
        finalProfile.data?.cards || [],
      message:
        "اطلاعات حساب با موفقیت ذخیره شد.",
    });
  } catch (error) {
    console.error(
      "Profile PUT API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "خطایی در ذخیره اطلاعات حساب رخ داد.",
      },
      { status: 500 }
    );
  }
}