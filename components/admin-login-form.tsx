import { FolderIcon } from "@/components/folder-icon";
import type { Profile } from "@/lib/profiles";

type AdminLoginFormProps = {
  profile: Profile;
  nextPath: string;
  initialError?: boolean;
};

export function AdminLoginForm({
  profile,
  nextPath,
  initialError = false
}: AdminLoginFormProps) {
  return (
    <form
      action="/admin/login/verify"
      method="post"
      className="grid w-full gap-5 border border-neutral-200 p-7 text-center"
    >
      <input type="hidden" name="next" value={nextPath} />
      <FolderIcon color={profile.color} className="mx-auto scale-75" />
      <div>
        <h1 className="text-sm font-semibold uppercase">Admin {profile.name}</h1>
        <p className="mt-3 text-xs uppercase text-neutral-500">
          Password di modifica
        </p>
      </div>
      <label className="sr-only" htmlFor="admin-password">
        Password admin
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        required
        className="h-12 border border-neutral-300 px-4 text-center text-lg outline-none focus:border-neutral-950"
      />
      {initialError ? (
        <p className="text-sm text-red-600">
          Password non valida per questo profilo.
        </p>
      ) : null}
      <button
        type="submit"
        className="h-11 border border-neutral-950 bg-neutral-950 px-4 text-xs uppercase text-white"
      >
        Entra in modifica
      </button>
    </form>
  );
}
