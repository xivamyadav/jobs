import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface TokenPayload {
  id?: string;
  username?: string;
  role?: string;
  exp?: number;
}

/*function getPayloadFromToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
         
    );
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}*/
function getPayloadFromToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
  // Safe and modern way for Next.js Middleware
    const json = Buffer.from(base64, "base64").toString('utf8');
    
    return JSON.parse(json) as TokenPayload;
  } catch (error) {
    return null;
  }
}
const PROTECTED_PATHS = ["/dashboard", "/logout"];
const LOGIN_PATH = "/login";
const SIGN_UP_PATH = "/sign-up";
const DASHBOARD_HOME = "/dashboard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.nextUrl.origin;

  const token = request.cookies.get("access")?.value;
  const payload = token ? getPayloadFromToken(token) : null;

  // Token expiry check
  const isExpired = payload?.exp ? payload.exp * 1000 < Date.now() : true;

  const isProtectedPath = PROTECTED_PATHS.some(
    (p) => pathname.startsWith(p) || pathname === p
  );

  const isAuthPath = pathname === LOGIN_PATH || pathname === SIGN_UP_PATH;

  // Token nahi hai ya expire ho gaya
  if (!token || !payload || isExpired) {
    if (isProtectedPath) {
      const returnUrl = `${pathname}${request.nextUrl.search}`;
      const loginUrl = new URL(LOGIN_PATH, origin);
      loginUrl.searchParams.set("returnUrl", returnUrl);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Already logged in hai toh dashboard pe redirect
  if (isAuthPath) {
    return NextResponse.redirect(new URL(DASHBOARD_HOME, origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/logout",
    "/login",
    "/sign-up",
  ],
};
