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
  primary: "btn-p",
  lime: "btn-lime",
  ghost: "btn-s",
};

const SIZES = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

/**
 * Any button that opens the fullscreen AI valuation demo. Owns the modal so it
 * can be dropped anywhere on the page.
 */
export default function DemoLauncher({
  variant = "primary",
  size = "md",
  className = "",
  children = "Try it free",
}: Props) {
  const [open, setOpen] = useState(false);
  const styles =
    variant === "plain" ? className : `btn ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={styles}>
        {children}
      </button>
      <DemoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
