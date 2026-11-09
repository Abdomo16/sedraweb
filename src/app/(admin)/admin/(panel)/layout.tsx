import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/store/Shell";
import { logout } from "@/features/admin/auth/actions";
import { requireAdmin } from "@/features/admin/auth/guard";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-leaf-700/10 hidden border-e bg-white md:flex md:min-h-dvh md:flex-col md:p-4">
        <Logo className="mx-auto h-14 w-auto" />
        <p className="text-leaf-900/70 mt-2 text-center text-xs">لوحة التحكم</p>
        <nav aria-label="القائمة" className="mt-6">
          <AdminNav variant="side" />
        </nav>
        <div className="mt-auto pt-6 text-sm">
          <p className="truncate font-bold">{admin.name}</p>
          <p className="text-ink/70 truncate text-xs" dir="ltr">
            {admin.email}
          </p>
          <form action={logout} className="mt-3">
            <button className="bg-leaf-100 text-leaf-900 hover:bg-leaf-500 min-h-10 w-full rounded-xl font-bold transition-colors hover:text-white">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 pb-20 md:pb-0">
        <header className="border-leaf-700/10 flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
          <Logo className="h-10 w-auto" />
          <form action={logout}>
            <button className="bg-leaf-100 text-leaf-900 min-h-10 rounded-xl px-4 text-sm font-bold">
              خروج
            </button>
          </form>
        </header>
        <main className="mx-auto w-full max-w-5xl p-4 md:p-8">{children}</main>
      </div>

      <nav
        aria-label="التنقل السريع"
        className="border-leaf-700/10 fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <AdminNav variant="bottom" />
      </nav>
    </div>
  );
}
