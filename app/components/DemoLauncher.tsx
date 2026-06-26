"use client";

import { useState } from "react";
import DemoModal from "./DemoModal";

type Props = { variant?: "nav" | "compact" | "banner"; className?: string };

/**
 * The "Try Demo" call-to-action used in the header. Owns the fullscreen demo
 * modal so it can be dropped anywhere a button is needed.
 */
export default function DemoLauncher({ variant = "nav", className = "" }: Props) {
  const [open, setOpen] = useState(false);

  // The banner sits on a dark green background, so invert to a lime fill.
  const colors =
    variant === "banner" ? "bg-lime text-green" : "bg-green text-lime";
  const base = `rounded-[10px] font-medium transition-transform hover:scale-[1.02] ${colors}`;
  const sizing =
    variant === "compact"
      ? "px-4 py-2 text-[13px]"
      : variant === "banner"
        ? "px-6 py-3 text-[14px]"
        : "px-5 py-2.5 text-[14px]";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${base} ${sizing} ${className}`}>
        Explore Demo
      </button>
      <DemoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
