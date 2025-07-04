import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { config as EnvConfig } from "./lib/config";

export function middleware(request: NextRequest) {
  // Correct way to get cookies from the incoming request
  const sessionId = request.cookies.get(EnvConfig.USER_SESSION_KEY)?.value;

  if (!sessionId) {
    // Delete the search params related to highlighting errors
    const url = new URL(request.url);
    if (url.searchParams.has("highlight") || url.searchParams.has("highlight-links")) {
      url.searchParams.delete("highlight");
      url.searchParams.delete("highlight-links");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
