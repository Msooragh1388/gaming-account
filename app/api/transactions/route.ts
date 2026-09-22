
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
     * GET ADMIN TRANSACTIONS
     * =========================================
     */

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
        transactions: Array.isArray(data) ? data : [],
      });
    }

    /*
     * =========================================
     * TOKEN CHECK FOR USER ACTIONS
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
      if (!transactionId || !Number.isInteger(transactionId)) {
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
     * APPROVE TRANSACTION
     * =========================================
     */

    if (action === "approve") {
      if (!transactionId || !Number.isInteger(transactionId)) {
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
        "approve_wallet_transaction",
        {
          p_transaction_id: transactionId,
        }
      );

      if (error) {
        console.error(
          "approve_wallet_transaction error:",
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
              "تأیید تراکنش انجام نشد.",
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
     * REJECT TRANSACTION
     * =========================================
     */

    if (action === "reject") {
      if (!transactionId || !Number.isInteger(transactionId)) {
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
        "reject_wallet_transaction",
        {
          p_transaction_id: transactionId,
        }
      );

      if (error) {
        console.error(
          "reject_wallet_transaction error:",
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
              "رد تراکنش انجام نشد.",
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