
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_PASSWORD = "Mohamad.1388";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // صفحه ورود ادمین آزاد باشد
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // محافظت از تمام مسیرهای /admin
  if (pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get(
      ADMIN_COOKIE_NAME
    )?.value;

    // اگر وارد نشده باشد، به صفحه ورود برود
    if (adminSession !== ADMIN_PASSWORD) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};