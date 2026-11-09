"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { DUMMY_HASH, verifyPassword } from "./password";
import { clearFailures, isBlocked, recordFailure } from "./rate-limit";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "./session";

export type LoginState = { error?: string };

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
});

const GENERIC_ERROR = "الإيميل أو كلمة السر غير صحيحة.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: GENERIC_ERROR };

  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const keys = [`ip:${ip}`, `email:${parsed.data.email}`];

  if (isBlocked(...keys)) {
    return { error: "محاولات كتير غلط. استنى 15 دقيقة وجرّب تاني." };
  }

  const user = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  // Always run one hash comparison so the response time does not reveal whether the account exists.
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    recordFailure(...keys);
    return { error: GENERIC_ERROR };
  }

  clearFailures(...keys);
  (await cookies()).set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
