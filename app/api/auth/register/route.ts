
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const mobile = String(body.mobile ?? "").trim();
    const password = String(body.password ?? "");

    if (!name || !mobile || !password) {
      return NextResponse.json(
        { error: "همه فیلدها الزامی هستند." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "رمز عبور باید حداقل ۸ کاراکتر باشد.",
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
      "register_user",
      {
        p_name: name,
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

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "خطایی در ثبت‌نام رخ داد." },
      { status: 500 }
    );
  }
}