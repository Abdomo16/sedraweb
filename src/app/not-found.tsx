import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-cedar-700 text-3xl font-extrabold">الصفحة غير موجودة</h1>
      <p>ممكن الرابط اتغير أو المنتج مش متاح دلوقتي.</p>
      <Link href="/" className="bg-cedar-700 rounded-full px-6 py-3 font-bold text-white">
        الرجوع للرئيسية
      </Link>
    </main>
  );
}
