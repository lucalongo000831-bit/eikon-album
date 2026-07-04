import type { CSSProperties } from "react";
import type { FolderColor } from "@/lib/types";

const folderColors: Record<FolderColor, string> = {
  black: "#171717",
  blue: "#3767c8",
  pink: "#d9799a",
  red: "#bd2430",
  beige: "#b5a27f",
  gray: "#72777d",
  green: "#0f4938"
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
