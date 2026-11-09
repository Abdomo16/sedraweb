import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/store/Shell";
import { getAdmin } from "@/features/admin/auth/guard";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <div className="shadow-soft rounded-3xl bg-white p-6">
        <Logo className="mx-auto h-16 w-auto" />
        <h1 className="font-display text-leaf-900 mt-4 text-center text-2xl font-extrabold">
          دخول لوحة التحكم
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
