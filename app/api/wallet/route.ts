import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body.token ?? "").trim();
    const action = String(body.action ?? "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "نشست کاربر معتبر نیست." },
        { status: 401 }
      );
    }

    // =========================
    // دریافت موجودی کیف پول
    // =========================
    if (action === "get") {
      const { data, error } = await supabase.rpc(
        "get_my_wallet",
        {
          p_token: token,
        }
      );

      if (error) {
        console.error("get_my_wallet error:", error);

        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(data);
    }

    // =========================
    // ثبت درخواست واریز
    // =========================
    if (action === "deposit") {
      const amount = Number(body.amount);
      const cardId = Number(body.cardId);

      if (!Number.isInteger(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "مبلغ واریز معتبر نیست." },
          { status: 400 }
        );
      }

      if (!Number.isInteger(cardId) || cardId <= 0) {
        return NextResponse.json(
          { error: "کارت بانکی را انتخاب کنید." },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.rpc(
        "create_wallet_deposit",
        {
          p_token: token,
          p_amount: amount,
          p_card_id: cardId,
        }
      );

      if (error) {
        console.error(
          "create_wallet_deposit error:",
          error
        );

        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(data);
    }

    // =========================
    // ثبت درخواست برداشت
    // =========================
    if (action === "withdraw") {
      const amount = Number(body.amount);
      const cardId = Number(body.cardId);

      if (!Number.isInteger(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "مبلغ برداشت معتبر نیست." },
          { status: 400 }
        );
      }

      if (!Number.isInteger(cardId) || cardId <= 0) {
        return NextResponse.json(
          { error: "کارت بانکی را انتخاب کنید." },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.rpc(
        "create_wallet_withdraw",
        {
          p_token: token,
          p_amount: amount,
          p_card_id: cardId,
        }
      );

      if (error) {
        console.error(
          "create_wallet_withdraw error:",
          error
        );

        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "عملیات نامعتبر است." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Wallet API error:", error);

    return NextResponse.json(
      {
        error: "خطایی در ارتباط با کیف پول رخ داد.",
      },
      { status: 500 }
    );
  }
}