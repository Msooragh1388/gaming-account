import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.rpc(
      "get_product_like_counts"
    );

    if (error) {
      console.error(
        "get_product_like_counts error:",
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

    return NextResponse.json({
      success: true,
      counts: data || [],
    });
  } catch (error) {
    console.error(
      "Likes counts API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "خطایی در دریافت تعداد لایک‌ها رخ داد.",
      },
      { status: 500 }
    );
  }
}