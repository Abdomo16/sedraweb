import { getAdmin } from "@/features/admin/auth/guard";
import { db } from "@/lib/db";

/** Number of orders waiting for confirmation (polled by the admin menu badge). */
export async function GET() {
  if (!(await getAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });
  const count = await db.order.count({ where: { status: "PENDING" } });
  return Response.json({ count }, { headers: { "Cache-Control": "no-store" } });
}
