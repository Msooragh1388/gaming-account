import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body.token ?? "").trim();
    const action = String(body.action ?? "").trim();
    const transactionId = Number(body.transactionId ?? 0);

    /*
     * =========================================
     * GET MY TRANSACTIONS
     * =========================================
     */

    if (!action) {
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
    }

    /*
     * =========================================
     * TOKEN CHECK
     * =========================================
     */

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

    /*
     * =========================================
     * CANCEL TRANSACTION
     * =========================================
     */

    if (action === "cancel") {
      if (
        !transactionId ||
        !Number.isInteger(transactionId)
      ) {
        return NextResponse.json(
          {
            error: "شناسه تراکنش معتبر نیست.",
          },
          {
            status: 400,
          }
        );
      }

      const { data, error } = await supabase.rpc(
        "cancel_my_wallet_transaction",
        {
          p_token: token,
          p_transaction_id: transactionId,
        }
      );

      if (error) {
        console.error(
          "cancel_my_wallet_transaction error:",
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
              "لغو تراکنش انجام نشد.",
          },
          {
            status: 400,
          }
        );
      }

      return NextResponse.json(data);
    }

    /*
     * =========================================
     * INVALID ACTION
     * =========================================
     */

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
      "Transactions API error:",
      error
    );

    return NextResponse.json(
      {
        error: "خطایی در پردازش تراکنش رخ داد.",
      },
      {
        status: 500,
      }
    );
  }
}