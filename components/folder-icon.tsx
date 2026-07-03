import type { CSSProperties } from "react";
import type { FolderColor } from "@/lib/types";

const folderColors: Record<FolderColor, string> = {
  black: "#111111",
  blue: "#5f87df",
  pink: "#e8a4bb",
  red: "#d62f3b",
  beige: "#c7b89b",
  gray: "#8e9297",
  green: "#173f32"
};

type FolderIconProps = {
  color: FolderColor;
  className?: string;
};

export function FolderIcon({ color, className }: FolderIconProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{ "--folder-color": folderColors[color] } as CSSProperties}
    >
      <span className="folder-shape block" />
    </span>
  );
}
