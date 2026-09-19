import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "نشست کاربر معتبر نیست." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc(
      "get_my_purchases",
      {
        p_token: token,
      }
    );

    if (error) {
      console.error("get_my_purchases error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data?.success) {
      return NextResponse.json(
        {
          error:
            data?.error ||
            "دریافت خریدها ناموفق بود.",
        },
        { status: 401 }
      );
    }

    const purchases = (data.purchases || []).map(
      (purchase: any) => ({
        ...purchase,

        backupPassword1:
          purchase.backupPassword1 ?? null,

        backupPassword2:
          purchase.backupPassword2 ?? null,
      })
    );

    return NextResponse.json({
      success: true,
      purchases,
    });
  } catch (error) {
    console.error("Purchases API error:", error);

    return NextResponse.json(
      {
        error:
          "خطایی در دریافت اکانت‌های خریداری‌شده رخ داد.",
      },
      { status: 500 }
    );
  }
}