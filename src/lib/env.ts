import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  /**
   * Show DRAFT products on the storefront. Local development only: imported
   * products stay DRAFT until the owner confirms their prices, so this must be
   * "false" (the default) in production.
   */
  SHOW_DRAFT_PRODUCTS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  /** Folder for uploaded media (product photos). Keep it outside `public/`. */
  MEDIA_DIR: z.string().default("./storage"),
  AUTH_SECRET: z.string().min(16).optional(),
  // Added in later phases:
  BOSTA_API_KEY: z.string().optional(),
  BOSTA_WEBHOOK_SECRET: z.string().optional(),
  PAYMOB_API_KEY: z.string().optional(),
  PAYMOB_HMAC_SECRET: z.string().optional(),
  REVALIDATE_SECRET: z.string().min(16).optional(),
});

/** Validated server env. Import only from server code. */
export const env = schema.parse(process.env);
