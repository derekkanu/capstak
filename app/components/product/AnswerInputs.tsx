"use client";

import { useState } from "react";
import { grouped, lastSixMonths, naira } from "../../lib/capstack/format";
import type { Question } from "../../lib/capstack/questions";
import type { Doc, DocKind } from "../../lib/capstack/types";

/* The answer fields for each kind of question. Big, thumb-friendly, one thing at a time. */

const field =
  "min-h-[60px] w-full rounded-[14px] border border-[#d7d9cd] bg-cream-soft px-5 text-[20px] outline-none transition-colors focus:border-ink";

export function TextAnswer({ q, value, onChange, onEnter }: { q: Question; value: string; onChange: (v: string) => void; onEnter: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        placeholder={q.placeholder}
        aria-label={q.prompt}
        className={field}
      />
      {q.picks && (
        <div className="flex flex-wrap gap-2">
          {q.picks.map((p) => (
            <button key={p} type="button" onClick={() => onChange(p)} className={`min-h-10 rounded-full px-4 text-[14px] ${value === p ? "bg-ink text-cream" : "bg-[#ecebe2] hover:bg-[#e0e0d6]"}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NumberAnswer({ q, value, onChange, onEnter }: { q: Question; value: number | undefined; onChange: (v: number | undefined) => void; onEnter: () => void }) {
  return (
    <input
      autoFocus
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) => {
        const d = e.target.value.replace(/\D/g, "");
        onChange(d ? Number(d) : undefined);
      }}
      onKeyDown={(e) => e.key === "Enter" && onEnter()}
      placeholder={q.placeholder}
      aria-label={q.prompt}
      className={`${field} max-w-[220px]`}
    />
  );
}

export function MoneyField({
  value,
  onChange,
  onEnter,
  label,
  placeholder,
  autoFocus,
  small,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  onEnter?: () => void;
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`flex items-center rounded-[14px] border border-[#d7d9cd] bg-cream-soft transition-colors focus-within:border-ink ${small ? "min-h-[52px]" : "min-h-[60px]"}`}>
      <span aria-hidden className={`pl-5 text-[#7a857c] ${small ? "text-[17px]" : "text-[20px]"}`}>
        ₦
      </span>
      <input
        autoFocus={autoFocus}
        inputMode="numeric"
        value={value === undefined ? "" : grouped(value)}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, "");
          onChange(d ? Number(d) : undefined);
        }}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        aria-label={label}
        className={`w-full min-w-0 bg-transparent px-2 pr-5 outline-none ${small ? "text-[17px]" : "text-[20px]"}`}
      />
    </div>
  );
}

export function MonthsAnswer({ value, onChange }: { value: (number | undefined)[]; onChange: (v: (number | undefined)[]) => void }) {
  const names = lastSixMonths();
  const filled = value.filter((v) => v !== undefined) as number[];
  const set = (i: number, v: number | undefined) => onChange(value.map((x, k) => (k === i ? v : x)));
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {names.map((n, i) => (
          <label key={n} className="flex items-center gap-3">
            <span className="w-11 shrink-0 text-[15px] text-[#5d6a61]">{n}</span>
            <span className="flex-1">
              <MoneyField small autoFocus={i === 0} value={value[i]} onChange={(v) => set(i, v)} label={`Sales in ${n}`} placeholder="1,400,000" />
            </span>
          </label>
        ))}
      </div>
      {filled.length > 0 && filled.length < 6 && (
        <button
          type="button"
          onClick={() => {
            const fill = filled[filled.length - 1];
            onChange(value.map((x) => x ?? fill));
          }}
          className="self-start text-[14px] text-[#3d4a42] underline"
        >
          Fill the empty months with {naira(filled[filled.length - 1])}
        </button>
      )}
    </div>
  );
}

export function ChoiceAnswer({ q, value, onPick }: { q: Question; value: unknown; onPick: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {q.options!.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(o.value)}
            className={`flex min-h-[60px] flex-col items-start justify-center gap-0.5 rounded-[14px] border px-5 py-3 text-left transition-colors ${on ? "border-ink bg-ink text-cream" : "border-[#d7d9cd] bg-cream-soft hover:border-ink"}`}
          >
            <span className="text-[16px] font-medium">{o.label}</span>
            {o.hint && <span className={`text-[13px] ${on ? "text-cream/70" : "text-[#5d6a61]"}`}>{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function MultiAnswer({ q, value, onChange }: { q: Question; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {q.options!.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={`min-h-12 rounded-full border px-5 text-[15px] transition-colors ${on ? "border-ink bg-ink text-cream" : "border-[#d7d9cd] bg-cream-soft hover:border-ink"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const DOC_KINDS: { value: DocKind; label: string }[] = [
  { value: "bank", label: "Bank statement" },
  { value: "pos", label: "POS slips" },
  { value: "receipts", label: "Receipts or invoices" },
  { value: "stock", label: "Stock list" },
  { value: "other", label: "Something else" },
];

/** Adds files to the owner's documents. Only the name and size are kept for now (see Documents page). */
export function UploadAnswer({ docs, onAdd, onRemove, kind: initialKind = "bank" }: { docs: Doc[]; onAdd: (d: Doc[]) => void; onRemove: (id: string) => void; kind?: DocKind }) {
  const [kind, setKind] = useState<DocKind>(initialKind);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="What kind of document">
        {DOC_KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            role="radio"
            aria-checked={kind === k.value}
            onClick={() => setKind(k.value)}
            className={`min-h-10 rounded-full px-4 text-[14px] ${kind === k.value ? "bg-ink text-cream" : "bg-[#ecebe2] hover:bg-[#e0e0d6]"}`}
          >
            {k.label}
          </button>
        ))}
      </div>
      <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-sage bg-[#f3f3ed] px-6 text-center hover:bg-[#ecebe2]">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        <span className="text-[16px] font-medium">Choose files or take a photo</span>
        <span className="text-[13px] text-[#5d6a61]">PDF or photos. Only you can see them until you choose to share.</span>
        <input
          type="file"
          multiple
          accept="application/pdf,image/*"
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            const now = new Date().toISOString();
            onAdd(files.map((f, i) => ({ id: `${Date.now()}-${i}`, kind, name: f.name, size: f.size, addedAt: now })));
            e.target.value = "";
          }}
        />
      </label>
      {docs.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 rounded-[12px] bg-[#f3f3ed] px-4 py-3 text-[14px]">
              <span className="min-w-0 truncate">
                <span className="text-[#5d6a61]">{DOC_KINDS.find((k) => k.value === d.kind)?.label} · </span>
                {d.name}
              </span>
              <button type="button" onClick={() => onRemove(d.id)} className="shrink-0 text-[13px] text-[#3d4a42] underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
