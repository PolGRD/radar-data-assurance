import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/connexion", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
