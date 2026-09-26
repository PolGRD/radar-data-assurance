// Signature et vérification du cookie de session, avec Web Crypto
// (utilisable à la fois dans proxy.ts et dans les routes API).

export const SESSION_COOKIE = "radar_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours, en secondes

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

// La clé dépend aussi du mot de passe : changer SITE_PASSWORD invalide toutes les sessions.
async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  const password = process.env.SITE_PASSWORD;
  if (!secret || !password) throw new Error("AUTH_SECRET et SITE_PASSWORD doivent être définis.");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(`${secret}:${password}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string): Promise<string> {
  return toHex(await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(payload)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  return `${expires}.${await sign(String(expires))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;
  try {
    return safeEqual(signature, await sign(expires));
  } catch {
    return false;
  }
}

// Comparaison du mot de passe saisi via leurs empreintes, en temps constant.
export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return false;
  const [a, b] = await Promise.all(
    [input, expected].map(async (v) => toHex(await crypto.subtle.digest("SHA-256", encoder.encode(v)))),
  );
  return safeEqual(a, b);
}

// N'accepte que les chemins internes, pour éviter toute redirection vers un autre site.
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  return value;
}
