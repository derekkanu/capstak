"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import SarahPanel from "../components/product/SarahPanel";
import { useOwnerFile } from "../lib/capstack/store";

/** Everything under /app needs a signed-in owner who has told Sarah why they came; anyone else goes to /start. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, file } = useOwnerFile();
  const router = useRouter();
  const path = usePathname();
  const allowed = !!file?.purpose;

  useEffect(() => {
    if (ready && !allowed) router.replace("/start");
  }, [ready, allowed, router]);

  if (!ready || !allowed) return <div className="min-h-svh bg-paper" />;
  return (
    <div className="min-h-svh bg-cream-soft text-ink">
      {children}
      {/* Sarah is on every page; the full-screen chapters open her from their top bar instead of the corner */}
      <SarahPanel file={file!} button={!path.startsWith("/app/file/")} />
    </div>
  );
}
