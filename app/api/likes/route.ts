import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token =
      typeof body?.token === "string"
        ? body.token.trim()
        : "";

    const productId = Number(body?.productId);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          loggedIn: false,
          error: "برای لایک کردن ابتدا وارد حساب شوید.",
        },
        { status: 401 }
      );
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "شناسه محصول نامعتبر است.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc(
      "toggle_product_like",
      {
        p_token: token,
        p_product_id: productId,
      }
    );

    if (error) {
      console.error(
        "toggle_product_like error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    if (!data?.success) {
      return NextResponse.json(
        data,
        {
          status:
            data?.loggedIn === false
              ? 401
              : 400,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Like API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "خطایی در ثبت لایک رخ داد.",
      },
      { status: 500 }
    );
  }
}