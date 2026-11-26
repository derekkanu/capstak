"use client";

import { useState, type ReactNode } from "react";
import ComingSoonModal from "./ComingSoonModal";

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
 * Any "Try it free" / guided-interview button. The guided valuation is being built next, so for now it opens
 * the coming-soon popup with the waitlist (DemoModal, the old AI interview demo, is kept for when it's back).
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
      <ComingSoonModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
