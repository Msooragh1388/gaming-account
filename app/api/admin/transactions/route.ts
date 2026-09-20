import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const action = String(body.action ?? "").trim();

    if (action !== "get") {
      return NextResponse.json(
        {
          error: "عملیات نامعتبر است.",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await supabase.rpc(
      "get_admin_wallet_transactions"
    );

    if (error) {
      console.error(
        "get_admin_wallet_transactions error:",
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

    return NextResponse.json({
      success: true,
      transactions: Array.isArray(data) ? data : [],
    });
  } catch (error) {
    console.error(
      "Admin transactions API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "خطایی در دریافت تراکنش‌های ادمین رخ داد.",
      },
      {
        status: 500,
      }
    );
  }
}