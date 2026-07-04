import { AccessBackdrop } from "@/components/access-backdrop";
import { getPublicAlbums } from "@/lib/data/albums";

type AccessPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "1";
  const nextPath = params?.next ?? "/";
  const albums = await getPublicAlbums();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5">
      <AccessBackdrop albums={albums} />
      <div className="absolute inset-0 bg-white/50" />
      <form
        action="/access/verify"
        method="post"
        className="relative z-10 grid w-full max-w-[360px] gap-5 border border-neutral-200 bg-white/86 p-7 text-center shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-md"
      >
        <input type="hidden" name="next" value={nextPath} />
        <img
          src="/eikon-mark.png"
          alt="EIKON"
          className="mx-auto size-[82px]"
          width="82"
          height="82"
        />
        <div>
          <h1 className="font-editorial text-xl uppercase">EIKON</h1>
          <p className="mt-3 text-xs uppercase text-neutral-500">
            Codice di accesso
          </p>
        </div>
        <label className="sr-only" htmlFor="code">
          Codice
        </label>
        <input
          id="code"
          name="code"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          className="h-12 border border-neutral-300 px-4 text-center text-lg outline-none focus:border-neutral-950"
        />
        {hasError ? (
          <p className="text-sm text-red-600">Codice non valido.</p>
        ) : null}
        <button
          type="submit"
          className="h-11 border border-neutral-950 bg-neutral-950 px-4 text-xs uppercase text-white"
        >
          Entra
        </button>
      </form>
    </main>
  );
}
