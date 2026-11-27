"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  setPreview,
  signOut,
  usePreview,
  type Preview,
} from "../../lib/capstack/store";
import type { OwnerFile } from "../../lib/capstack/types";
import { Wordmark } from "./Bits";

// testing only: switch the desk between the owner's real file, a brand-new owner, and one with everything provided
const VIEWS: { value: Preview; label: string; hint: string }[] = [
  { value: "mine", label: "My file", hint: "Your real answers" },
  { value: "new", label: "New owner", hint: "Nothing filled in yet" },
  {
    value: "complete",
    label: "All provided",
    hint: "Every chapter and documents",
  },
];

const NAV = [
  { href: "/app", label: "Overview" },
  { href: "/app/documents", label: "Documents" },
  { href: "/app/report", label: "Report" },
  { href: "/app/faq", label: "FAQ" },
];

export default function AppHeader({ file }: { file: OwnerFile }) {
  const path = usePathname();
  const router = useRouter();
  const preview = usePreview();
  return (
    <header className="flex flex-wrap items-center gap-x-9 gap-y-4 pb-10 pt-6 print:hidden">
      <Wordmark />
      <nav
        aria-label="Main"
        className="flex flex-wrap gap-x-6 gap-y-1 text-[14px]"
      >
        {NAV.map((n) => {
          const on =
            n.href === "/app" ? path === "/app" : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={on ? "page" : undefined}
              className={`no-underline ${on ? "font-semibold text-ink" : "text-[#3d4a42] hover:text-ink"}`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto flex items-center gap-4">
        {preview !== "mine" && (
          <span className="rounded-full bg-pop/15 px-3 py-1.5 text-[13px] text-[#a33a12]">Previewing: {VIEWS.find((v) => v.value === preview)?.label}</span>
        )}
        <details className="relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 text-[14px] [&::-webkit-details-marker]:hidden">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-soft text-[14px] font-semibold"
            >
              {file.name.slice(0, 1).toUpperCase()}
            </span>
            {file.name}
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-[14px] bg-cream-soft p-2 shadow-[0_20px_40px_-20px_rgba(15,27,20,0.35)]">
            <p className="px-3 pb-2 pt-1 text-[12px] text-[#5d6a61]">
              {file.email}
            </p>
            <div
              className="mb-1 border-y border-[#e3e4dc] px-1 py-2"
              role="radiogroup"
              aria-label="Testing view"
            >
              <p className="m-0 px-2 pb-1.5 text-[12px] text-[#7a857c]">Testing view</p>
              {VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  role="radio"
                  aria-checked={preview === v.value}
                  onClick={(e) => {
                    setPreview(v.value);
                    (
                      e.currentTarget.closest(
                        "details",
                      ) as HTMLDetailsElement | null
                    )?.removeAttribute("open");
                    router.push("/app");
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-[10px] px-2.5 py-2 text-left ${preview === v.value ? "bg-[#ecebe2]" : "hover:bg-[#f3f3ed]"}`}
                >
                  <span className="flex flex-col">
                    <span className="text-[14px]">{v.label}</span>
                    <span className="text-[12px] text-[#5d6a61]">{v.hint}</span>
                  </span>
                  <span
                    aria-hidden
                    className={`h-3.5 w-3.5 shrink-0 rounded-full border ${preview === v.value ? "border-[4px] border-ink" : "border-[#9aa39b]"}`}
                  />
                </button>
              ))}
              {preview !== "mine" && (
                <p className="m-0 px-2.5 pt-1.5 text-[11px] leading-[1.4] text-[#7a857c]">
                  Changes made in a preview are dropped when you go back to My
                  file.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                signOut();
                router.push("/start");
              }}
              className="w-full rounded-[10px] px-3 py-2.5 text-left text-[14px] hover:bg-[#ecebe2]"
            >
              Log out
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
