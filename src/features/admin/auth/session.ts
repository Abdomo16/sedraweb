import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

import { SESSION_MAX_AGE } from "./constants";

export { SESSION_COOKIE, SESSION_MAX_AGE } from "./constants";

type Payload = { uid: string; exp: number };

function secret(): string {
  if (!env.AUTH_SECRET) throw new Error("AUTH_SECRET is not set");
  return env.AUTH_SECRET;
}

const b64 = (input: Buffer | string) => Buffer.from(input).toString("base64url");

function sign(body: string): string {
  return b64(createHmac("sha256", secret()).update(body).digest());
}

/** Signed token: base64url(payload).base64url(hmac). No secrets inside the payload. */
export function createSessionToken(userId: string): string {
  const payload: Payload = { uid: userId, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token: string | undefined): Payload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (typeof payload.uid !== "string" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
