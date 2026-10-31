"use client";

import { useState, type ReactNode } from "react";
import DemoModal from "./DemoModal";

type Variant = "primary" | "lime" | "ghost" | "plain";

type Props = {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
};

const VARIANTS: Record<Exclude<Variant, "plain">, string> = {
  primary: "bg-green text-lime hover:bg-green-mid",
  lime: "bg-lime text-green hover:bg-lime-soft",
  ghost: "bg-ink/[0.06] text-ink hover:bg-ink/[0.1]",
};

const SIZES = {
  sm: "px-3.5 py-2 text-[13px]",
  md: "px-4 py-2.5 text-[14px]",
  lg: "px-5 py-3 text-[15px]",
};

/**
 * Any button that opens the fullscreen AI valuation demo. Owns the modal so it
 * can be dropped anywhere on the page.
 */
export default function DemoLauncher({
  variant = "primary",
  size = "md",
  className = "",
  children = "Explore Demo",
}: Props) {
  const [open, setOpen] = useState(false);
  const styles =
    variant === "plain"
      ? className
      : `inline-flex items-center gap-1.5 rounded-[8px] font-medium transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={styles}>
        {children}
      </button>
      <DemoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
