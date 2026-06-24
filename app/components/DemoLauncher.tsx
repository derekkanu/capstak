"use client";

import { useState } from "react";
import DemoModal from "./DemoModal";

type Props = { variant?: "nav" | "compact"; className?: string };

/**
 * The "Try Demo" call-to-action used in the header. Owns the fullscreen demo
 * modal so it can be dropped anywhere a button is needed.
 */
export default function DemoLauncher({ variant = "nav", className = "" }: Props) {
  const [open, setOpen] = useState(false);

  const base =
    "rounded-[10px] bg-green font-medium text-lime transition-transform hover:scale-[1.02]";
  const sizing =
    variant === "compact" ? "px-4 py-2 text-[13px]" : "px-5 py-2.5 text-[14px]";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${base} ${sizing} ${className}`}>
        Explore Demo
      </button>
      <DemoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
