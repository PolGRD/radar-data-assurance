import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkPassword, createSessionToken, safeNextPath, SESSION_MAX_AGE, verifySessionToken } from "./auth";

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", "secret-de-test");
  vi.stubEnv("SITE_PASSWORD", "mot-de-passe-de-test");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("session", () => {
  it("accepte un jeton qu'il vient de créer", async () => {
    expect(await verifySessionToken(await createSessionToken())).toBe(true);
  });

  it("refuse l'absence de jeton et les jetons mal formés", async () => {
    for (const jeton of [undefined, "", "abc", "123", "123.", ".abc", "12a.abcdef"]) {
      expect(await verifySessionToken(jeton), String(jeton)).toBe(false);
    }
  });

  it("refuse un jeton dont on a prolongé la date d'expiration sans pouvoir le signer", async () => {
    const [expiration, signature] = (await createSessionToken()).split(".");
    expect(await verifySessionToken(`${Number(expiration) + 3600}.${signature}`)).toBe(false);
  });

  it("refuse un jeton expiré après 30 jours", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T10:00:00Z"));
    const jeton = await createSessionToken();
    vi.setSystemTime(new Date(Date.parse("2026-10-01T10:00:00Z") + (SESSION_MAX_AGE - 60) * 1000));
    expect(await verifySessionToken(jeton)).toBe(true);
    vi.setSystemTime(new Date(Date.parse("2026-10-01T10:00:00Z") + (SESSION_MAX_AGE + 60) * 1000));
    expect(await verifySessionToken(jeton)).toBe(false);
  });

  it("invalide toutes les sessions quand le mot de passe du site change", async () => {
    const jeton = await createSessionToken();
    vi.stubEnv("SITE_PASSWORD", "nouveau-mot-de-passe");
    expect(await verifySessionToken(jeton)).toBe(false);
  });

  it("refuse tout jeton quand la configuration est incomplète, sans planter", async () => {
    const jeton = await createSessionToken();
    vi.stubEnv("AUTH_SECRET", "");
    expect(await verifySessionToken(jeton)).toBe(false);
  });
});

describe("checkPassword", () => {
  it("accepte le bon mot de passe et refuse les autres", async () => {
    expect(await checkPassword("mot-de-passe-de-test")).toBe(true);
    expect(await checkPassword("Mot-de-passe-de-test")).toBe(false);
    expect(await checkPassword("")).toBe(false);
  });

  it("refuse tout quand aucun mot de passe n'est configuré", async () => {
    vi.stubEnv("SITE_PASSWORD", "");
    expect(await checkPassword("")).toBe(false);
  });
});

describe("safeNextPath (redirection après connexion)", () => {
  it("conserve les chemins internes au site", () => {
    expect(safeNextPath("/calendrier#ai-act")).toBe("/calendrier#ai-act");
    expect(safeNextPath("/veille?pilier=IA")).toBe("/veille?pilier=IA");
  });

  it("ramène à l'accueil toute adresse qui sortirait du site", () => {
    for (const valeur of ["https://pirate.example", "//pirate.example", "/\\pirate.example", "javascript:alert(1)", "", null, 42]) {
      expect(safeNextPath(valeur), String(valeur)).toBe("/");
    }
  });
});
