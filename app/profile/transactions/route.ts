import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body.token ?? "").trim();

    if (!token) {
      return NextResponse.json(
        {
          error: "نشست کاربر معتبر نیست.",
        },
        {
          status: 401,
        }
      );
    }

    const { data, error } = await supabase.rpc(
      "get_my_wallet_transactions",
      {
        p_token: token,
      }
    );

    if (error) {
      console.error(
        "get_my_wallet_transactions error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Transactions API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "خطایی در دریافت تراکنش‌ها رخ داد.",
      },
      {
        status: 500,
      }
    );
  }
}