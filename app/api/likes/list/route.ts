import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token =
      typeof body?.token === "string"
        ? body.token.trim()
        : "";

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          loggedIn: false,
          likedProductIds: [],
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc(
      "get_user_product_likes",
      {
        p_token: token,
      }
    );

    if (error) {
      console.error("get_user_product_likes error:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Likes list API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "خطایی در دریافت لایک‌ها رخ داد.",
      },
      { status: 500 }
    );
  }
}