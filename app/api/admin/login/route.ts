
import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_PASSWORD = "Mohamad.1388";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          error: "رمز عبور اشتباه است.",
        },
        {
          status: 401,
        }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: ADMIN_PASSWORD,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "درخواست نامعتبر است.",
      },
      {
        status: 400,
      }
    );
  }
}
