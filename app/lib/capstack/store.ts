"use client";

import { useSyncExternalStore } from "react";
import { toBenchmarkRecord } from "./benchmark";
import { SAMPLE_BASICS, SAMPLE_MODEL, SAMPLE_NUMBERS, sampleDocs } from "./sample";
import type { OwnerFile } from "./types";

/* The browser store. Until there are real accounts, each email's file lives in this browser's localStorage, and
   "signed in" means a session email is set. The same email on the same browser opens the same file again. Real
   email codes and a database replace this later without changing the screens. */

const KEY = "capstack:v1";

export type Preview = "mine" | "new" | "complete";

/* `stash` holds the owner's real file while a testing preview (an empty file, or a complete one) is shown in its
   place; switching back to "mine" restores it and drops whatever was changed during the preview. */
type State = { session: string | null; files: Record<string, OwnerFile>; preview?: Preview; stash?: OwnerFile };

const empty: State = { session: null, files: {} };
let cache: State | null = null;
const listeners = new Set<() => void>();

function read(): State {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    cache = empty;
  }
  return cache!;
}

function write(next: State) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private mode or full storage: keep it in memory for this visit
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const normaliseEmail = (e: string) => e.trim().toLowerCase();

export function hasFile(email: string) {
  return !!read().files[normaliseEmail(email)];
}

/** signs in (or up): opens this email's file, starting a new one if there isn't one */
export function signIn(name: string, email: string, shareFigures = false) {
  const s = read();
  const key = normaliseEmail(email);
  const now = new Date().toISOString();
  const existing = s.files[key];
  const file: OwnerFile = existing ?? {
    name: name.trim(),
    email: key,
    purpose: null,
    basics: null,
    numbers: null,
    model: {},
    docs: [],
    consent: { benchmarks: shareFigures, at: now },
    createdAt: now,
    updatedAt: now,
  };
  write({ session: key, files: { ...s.files, [key]: file } });
}

export function signOut() {
  // leaving a preview puts the real file back first
  if (read().preview && read().preview !== "mine") setPreview("mine");
  write({ ...read(), session: null });
}

/** Testing: show the dashboard as a brand-new owner, or with everything provided, then switch back. */
export function setPreview(mode: Preview) {
  const s = read();
  if (!s.session || !s.files[s.session]) return;
  const real = s.stash ?? s.files[s.session];
  if (mode === "mine") {
    write({ ...s, files: { ...s.files, [s.session]: real }, preview: undefined, stash: undefined });
    return;
  }
  const now = new Date().toISOString();
  const shown: OwnerFile =
    mode === "new"
      ? { ...real, basics: null, numbers: null, model: {}, docs: [], chapterUpdatedAt: {}, updatedAt: now }
      : {
          ...real,
          purpose: real.purpose ?? "sell",
          basics: SAMPLE_BASICS,
          numbers: { ...SAMPLE_NUMBERS, months: [...SAMPLE_NUMBERS.months] },
          model: { ...SAMPLE_MODEL },
          docs: sampleDocs(now),
          chapterUpdatedAt: { basics: now, numbers: now, model: now },
          updatedAt: now,
        };
  write({ ...s, files: { ...s.files, [s.session]: shown }, preview: mode, stash: real });
}

/** The owner's choice to let Capstack use their figures, without their name, for benchmarks. */
export function setConsent(on: boolean) {
  updateFile((f) => ({ ...f, consent: { benchmarks: on, at: new Date().toISOString() } }));
  if (on) shareFigures();
}

/** Sends this file's anonymised record, only if the owner agreed, and never from a testing preview. */
export function shareFigures() {
  const s = read();
  if (!s.session || (s.preview && s.preview !== "mine")) return;
  let f = s.files[s.session];
  if (!f?.consent?.benchmarks) return;
  if (!f.benchmarkId) {
    updateFile((x) => ({ ...x, benchmarkId: crypto.randomUUID() }));
    f = read().files[s.session];
  }
  const record = toBenchmarkRecord(f, f.benchmarkId!);
  if (!record) return;
  fetch("/api/benchmarks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(record) }).catch(() => {});
}

export function usePreview(): Preview {
  return useSyncExternalStore(
    subscribe,
    () => read().preview ?? "mine",
    () => "mine",
  );
}

export function updateFile(change: (f: OwnerFile) => OwnerFile) {
  const s = read();
  if (!s.session || !s.files[s.session]) return;
  const next = { ...change(s.files[s.session]), updatedAt: new Date().toISOString() };
  write({ ...s, files: { ...s.files, [s.session]: next } });
}

/** the signed-in owner's file; `ready` is false until the browser store has been read */
export function useOwnerFile(): { ready: boolean; file: OwnerFile | null } {
  const state = useSyncExternalStore(
    subscribe,
    () => read(),
    () => null,
  );
  if (!state) return { ready: false, file: null };
  return { ready: true, file: state.session ? state.files[state.session] ?? null : null };
}
