import Link from "next/link";

type BreadcrumbProps = {
  current: string;
};

export function Breadcrumb({ current }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs uppercase text-neutral-500">
      <Link href="/" className="hover:text-black">
        Home
      </Link>
      <span className="px-2">/</span>
      <span className="text-neutral-900">{current}</span>
    </nav>
  );
}
