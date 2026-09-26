import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Chemins accessibles sans être connecté.
const PUBLIC_PATHS = ["/connexion", "/api/login"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/connexion";
  url.search = "";
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  // Tout le site est protégé, sauf les fichiers techniques de Next.js et robots.txt.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
