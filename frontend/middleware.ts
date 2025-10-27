import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

const PUBLIC_STATIC_PREFIX = [
  "/_next",
  "/__nextjs",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

const RESERVED_SINGLE_SEGMENTS = new Set<string>([
  "login",
  "register",
  "forgot-password",
  "dashboard",
  "settings",
  "account",
  "api",
  "_next",
  "__nextjs",
  "assets",
  "public",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

const API_VERIFY_PATH = "/api/v1/auth/verify";

function isStaticPublic(pathname: string) {
  return PUBLIC_STATIC_PREFIX.some((p) => pathname.startsWith(p));
}

function isRoot(pathname: string) {
  return pathname === "/";
}

// Whitelist username publik: hanya 1 segmen & bukan reserved
function isPublicUsername(pathname: string) {
  if (!pathname || pathname === "/") return false;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  return !RESERVED_SINGLE_SEGMENTS.has(segments[0]);
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.includes(pathname);
}

async function verifySession(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  if (!cookieHeader) return false;
  try {
    const res = await fetch(new URL(API_VERIFY_PATH, req.nextUrl.origin), {
      method: "GET",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isStaticPublic(pathname)) return NextResponse.next();

  if (isRoot(pathname) || isPublicUsername(pathname)) {
    return NextResponse.next();
  }

  if (isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  const ok = await verifySession(req);
  if (!ok) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/.*|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|__nextjs/.*).*)",
  ],
};
