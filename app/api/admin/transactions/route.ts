import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const action = String(body.action ?? "").trim();

    // =========================================
    // GET TRANSACTIONS
    // =========================================

    if (action === "get") {
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
        transactions: Array.isArray(data)
          ? data
          : [],
      });
    }

    // =========================================
    // APPROVE / REJECT
    // =========================================

    if (
      action === "approve" ||
      action === "reject"
    ) {
      const transactionId = Number(
        body.transactionId
      );

      if (
        !Number.isInteger(transactionId) ||
        transactionId <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "شناسه تراکنش معتبر نیست.",
          },
          {
            status: 400,
          }
        );
      }

      const { data, error } =
        await supabase.rpc(
          "process_wallet_transaction",
          {
            p_transaction_id:
              transactionId,

            p_action: action,
          }
        );

      if (error) {
        console.error(
          "process_wallet_transaction error:",
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

      if (!data?.success) {
        return NextResponse.json(
          {
            error:
              data?.error ||
              "پردازش تراکنش انجام نشد.",
          },
          {
            status: 400,
          }
        );
      }

      return NextResponse.json({
        success: true,
        transactionId:
          data.transactionId,
        status: data.status,
      });
    }

    // =========================================
    // INVALID ACTION
    // =========================================

    return NextResponse.json(
      {
        error: "عملیات نامعتبر است.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Admin transactions API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "خطایی در پردازش تراکنش رخ داد.",
      },
      {
        status: 500,
      }
    );
  }
}