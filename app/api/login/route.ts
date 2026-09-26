import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, checkPassword, createSessionToken, safeNextPath } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const next = safeNextPath(form.get("next"));

  // Configuration incomplète dans Vercel : message clair plutôt qu'une erreur 500.
  const missing = ["SITE_PASSWORD", "AUTH_SECRET"].filter((name) => !process.env[name]);
  if (missing.length) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("erreur", "config");
    url.searchParams.set("manque", missing.join(","));
    return NextResponse.redirect(url, 303);
  }

  if (!(await checkPassword(password))) {
    // Petit délai pour freiner les essais en rafale.
    await new Promise((resolve) => setTimeout(resolve, 800));
    const url = new URL("/connexion", request.url);
    url.searchParams.set("erreur", "1");
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
