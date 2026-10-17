import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { proxy } from "./proxy";

const SITE = "https://radar.example";

function requete(chemin: string, jeton?: string): NextRequest {
  return new NextRequest(`${SITE}${chemin}`, { headers: jeton ? { cookie: `${SESSION_COOKIE}=${jeton}` } : {} });
}

// NextResponse.next() se reconnaît à son en-tête x-middleware-next.
const laissePasser = (r: Response) => r.headers.get("x-middleware-next") === "1";

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", "secret-de-test");
  vi.stubEnv("SITE_PASSWORD", "mot-de-passe-de-test");
});
afterEach(() => vi.unstubAllEnvs());

describe("garde d'accès", () => {
  it("laisse toujours passer la page de connexion et l'envoi du mot de passe", async () => {
    expect(laissePasser(await proxy(requete("/connexion")))).toBe(true);
    expect(laissePasser(await proxy(requete("/api/login")))).toBe(true);
  });

  it("redirige un visiteur non connecté vers la connexion, en mémorisant la page demandée", async () => {
    const r = await proxy(requete("/veille?pilier=IA"));
    expect(r.status).toBe(307);
    const cible = new URL(r.headers.get("location")!);
    expect(cible.pathname).toBe("/connexion");
    expect(cible.searchParams.get("next")).toBe("/veille?pilier=IA");
  });

  it("redirige l'accueil vers la connexion sans paramètre de retour", async () => {
    const cible = new URL((await proxy(requete("/"))).headers.get("location")!);
    expect(cible.pathname).toBe("/connexion");
    expect(cible.search).toBe("");
  });

  it("répond 401 aux appels d'API non connectés, sans redirection", async () => {
    const r = await proxy(requete("/api/revalidate"));
    expect(r.status).toBe(401);
    expect(r.headers.get("location")).toBeNull();
  });

  it("laisse passer un visiteur connecté", async () => {
    const jeton = await createSessionToken();
    expect(laissePasser(await proxy(requete("/calendrier", jeton)))).toBe(true);
    expect(laissePasser(await proxy(requete("/api/revalidate", jeton)))).toBe(true);
  });

  it("redirige un visiteur dont le cookie est falsifié", async () => {
    const r = await proxy(requete("/regles", "9999999999.faux"));
    expect(new URL(r.headers.get("location")!).pathname).toBe("/connexion");
  });
});
