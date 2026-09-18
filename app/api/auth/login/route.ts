import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const identifier = String(body.identifier ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "ایمیل یا شماره موبایل و رمز عبور را وارد کنید." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("login_user", {
      p_identifier: identifier,
      p_password: password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data?.success) {
      return NextResponse.json(
        { error: data?.error || "ورود ناموفق بود." },
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