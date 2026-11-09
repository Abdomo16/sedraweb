import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { readSessionToken, SESSION_COOKIE } from "./session";

export type Admin = { id: string; email: string; name: string };

/** Current admin or null. Checks the signature, the expiry and that the user still exists. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  // The session expiry uses the current time, so this must run per request, never at prerender.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = readSessionToken(token);
  if (!session) return null;
  return db.adminUser.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, name: true },
  });
});

/** Call at the top of every admin page and every admin Server Action. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
