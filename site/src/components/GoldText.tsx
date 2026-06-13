import type { ElementType, ReactNode } from "react";

type GoldTextProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Slow travelling sheen across the foil. */
  shimmer?: boolean;
};

/** Display-serif text filled with the gold-foil gradient. */
export function GoldText({
  children,
  as: Tag = "span",
  className = "",
  shimmer = false,
}: GoldTextProps) {
  return (
    <Tag className={`font-display ${shimmer ? "text-foil-anim" : "text-foil"} ${className}`}>
      {children}
    </Tag>
  );
}
