import { NextResponse, type NextRequest } from "next/server";
import { estPublic, redirectionVisiteur } from "@/lib/acces";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (estPublic(pathname)) return NextResponse.next();

  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = redirectionVisiteur(pathname);
  url.search = "";
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  // Tout passe par ici, sauf les fichiers techniques de Next.js et robots.txt ; estPublic décide du reste.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
