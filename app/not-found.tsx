import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-52px)] items-center justify-center bg-white px-6 pt-[52px]">
      <div className="text-center">
        <p className="text-xs uppercase text-neutral-500">Cartella non trovata</p>
        <Link className="mt-4 inline-block text-sm underline underline-offset-4" href="/">
          Torna al desktop
        </Link>
      </div>
    </main>
  );
}
