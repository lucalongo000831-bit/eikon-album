import { FolderIcon } from "@/components/folder-icon";
import { profiles } from "@/lib/profiles";

export function ProfileChooser() {
  return (
    <form
      action="/profiles/select"
      method="post"
      className="grid w-full grid-cols-1 gap-12 sm:grid-cols-3"
    >
      {profiles.map((profile) => (
        <button
          key={profile.key}
          type="submit"
          name="profile"
          value={profile.key}
          className="group grid place-items-center gap-5 text-center outline-none"
        >
          <FolderIcon
            color={profile.color}
            className="scale-95 transition group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
          />
          <span className="text-sm font-semibold uppercase text-neutral-900">
            {profile.name}
          </span>
        </button>
      ))}
    </form>
  );
}
