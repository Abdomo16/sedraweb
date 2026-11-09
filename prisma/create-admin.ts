import "dotenv/config";
import readline from "node:readline";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/features/admin/auth/password";

/**
 * Creates or updates an admin account.
 *   npm run admin:create                       uses ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from .env
 *   npm run admin:create -- --email a@b.com --name "Owner"    asks for the password (hidden)
 * In production a password of at least 12 characters is required.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const state = rl as unknown as { _writeToOutput: (s: string) => void };
    process.stdout.write(question);
    state._writeToOutput = () => {};
    rl.question("", (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const fromArgs = arg("email");
  const email = (fromArgs ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const name = arg("name") ?? process.env.ADMIN_NAME ?? "Admin";
  if (!email) throw new Error("Provide --email or set ADMIN_EMAIL in .env");

  const password = fromArgs ? await askHidden("Password: ") : process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("No password provided (set ADMIN_PASSWORD or use --email)");

  const production = process.env.NODE_ENV === "production";
  if (password.length < 12) {
    if (production) throw new Error("Use a password of at least 12 characters in production.");
    console.warn("Warning: short password. Fine for local development, change it before launch.");
  }

  const passwordHash = await hashPassword(password);
  await prisma.adminUser.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });
  console.log(`Admin account ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
