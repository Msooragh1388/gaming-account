
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const mobile = String(body.mobile ?? "").trim();
    const password = String(body.password ?? "");

    if (!mobile || !password) {
      return NextResponse.json(
        {
          error:
            "شماره موبایل و رمز عبور را وارد کنید.",
        },
        { status: 400 }
      );
    }

    if (!/^09\d{9}$/.test(mobile)) {
      return NextResponse.json(
        {
          error:
            "شماره موبایل باید به شکل 09123456789 باشد.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc(
      "login_user",
      {
        p_mobile: mobile,
        p_password: password,
      }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data?.success) {
      return NextResponse.json(
        {
          error:
            data?.error || "ورود ناموفق بود.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "خطایی در ورود رخ داد." },
      { status: 500 }
    );
  }
}