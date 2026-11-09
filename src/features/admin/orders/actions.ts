"use server";

import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "../auth/guard";
import { normalizeDigits } from "../catalog/utils";

const done = (id: string, flag: string) => redirect(`/admin/orders/${id}?done=${flag}`);
const fail = (id: string, flag: string) => redirect(`/admin/orders/${id}?error=${flag}`);

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function log(
  tx: Prisma.TransactionClient,
  orderId: string,
  adminName: string,
  type: string,
  message?: string,
) {
  return tx.orderEvent.create({ data: { orderId, type, message: message || null, adminName } });
}

/** The team spoke to the customer: mark the order confirmed, optionally with a deposit taken by phone. */
export async function confirmOrder(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const order = await db.order.findUnique({ where: { id } });
  if (!order || order.status !== "PENDING") return fail(id, "state");

  const depositRaw = text(formData, "deposit");
  let deposit = 0;
  if (depositRaw) {
    const n = Number(normalizeDigits(depositRaw));
    if (!Number.isFinite(n) || n < 0) return fail(id, "deposit");
    deposit = Math.round(n * 100);
    if (deposit > order.total) return fail(id, "deposit");
  }
  const note = text(formData, "note");

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        confirmedBy: admin.name,
        depositAmount: deposit,
      },
    });
    await log(
      tx,
      id,
      admin.name,
      "confirmed",
      [deposit ? `دفعة مقدمة ${deposit / 100} ج.م` : "", note].filter(Boolean).join(" · ") ||
        undefined,
    );
  });
  done(id, "confirmed");
}

/** Tried to reach the customer: keep the order in the queue and count the attempt. */
export async function noAnswer(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const order = await db.order.findUnique({ where: { id } });
  if (!order || order.status !== "PENDING") return fail(id, "state");
  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { callAttempts: { increment: 1 } } });
    await log(tx, id, admin.name, "no_answer", text(formData, "note") || "اتصلنا ومحدش رد");
  });
  done(id, "no_answer");
}

/** Cancel by hand (reason required). The reserved stock goes back on the shelf. */
export async function cancelOrder(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const reason = text(formData, "reason");
  if (reason.length < 2) return fail(id, "reason");

  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || (order.status !== "PENDING" && order.status !== "CONFIRMED"))
    return fail(id, "state");

  await db.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }
    await tx.order.update({
      where: { id },
      data: { status: "CANCELLED", cancelReason: reason, cancelledAt: new Date() },
    });
    await log(tx, id, admin.name, "cancelled", reason);
  });
  done(id, "cancelled");
}

/** Reopen a cancelled order if the stock is still there. */
export async function reopenOrder(id: string) {
  const admin = await requireAdmin();
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || order.status !== "CANCELLED") return fail(id, "state");

  try {
    await db.$transaction(async (tx) => {
      for (const item of order.items) {
        const reserved = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (reserved.count !== 1) throw new Error("stock");
      }
      await tx.order.update({
        where: { id },
        data: { status: "PENDING", cancelReason: null, cancelledAt: null },
      });
      await log(tx, id, admin.name, "reopened");
    });
  } catch {
    return fail(id, "stock");
  }
  done(id, "reopened");
}

const transitions = {
  shipped: { from: ["CONFIRMED"], to: "SHIPPED", label: "اتشحن" },
  delivered: { from: ["SHIPPED"], to: "DELIVERED", label: "اتسلم" },
  returned: { from: ["SHIPPED", "DELIVERED"], to: "RETURNED", label: "مرتجع" },
} as const;

/** Manual status moves until Bosta (Phase 6) takes over shipping updates. */
export async function moveOrder(id: string, step: keyof typeof transitions) {
  const admin = await requireAdmin();
  const rule = transitions[step];
  const order = await db.order.findUnique({ where: { id } });
  if (!order || !(rule.from as readonly string[]).includes(order.status)) return fail(id, "state");
  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status: rule.to } });
    await log(tx, id, admin.name, step, rule.label);
  });
  done(id, step);
}

export async function addOrderNote(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const note = text(formData, "note");
  if (!note) return fail(id, "note");
  const order = await db.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) return fail(id, "state");
  await db.orderEvent.create({
    data: { orderId: id, type: "note", message: note, adminName: admin.name },
  });
  done(id, "note");
}
