"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AppHeader from "../../components/product/AppHeader";
import { DOC_KINDS, UploadAnswer } from "../../components/product/AnswerInputs";
import { SarahAvatar } from "../../components/product/Bits";
import { audience } from "../../lib/capstack/sarah";
import { updateFile, useOwnerFile } from "../../lib/capstack/store";
import type { DocKind } from "../../lib/capstack/types";

/* Everything the owner has added, and why each kind matters. Documents back up the answers: they never change
   the value on their own, they make us surer of it (a tighter range). Only names and sizes are kept for now;
   storing the files themselves comes with real accounts. */

const WHY: Record<DocKind, string> = {
  bank: "Backs up the sales you told us about. The biggest single boost to how sure we are.",
  pos: "Shows card and transfer sales day by day.",
  receipts: "Backs up your costs and who you buy from.",
  stock: "Backs up what your stock is worth.",
  other: "Licences, leases, contracts: anything a buyer would ask to see.",
};

function Documents() {
  const { file } = useOwnerFile();
  const kind = (useSearchParams().get("kind") as DocKind | null) ?? "bank";
  if (!file) return null;
  const who = audience(file.purpose);
  const hasBank = file.docs.some((d) => d.kind === "bank");

  return (
    <>
      <div className="bg-[#ecebe2] px-5 pb-12 md:px-16">
        <AppHeader file={file} />
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-8">
          <div className="flex flex-[1_1_420px] flex-col gap-4">
            <h1 className="display m-0 text-[clamp(36px,4vw,56px)] font-normal leading-[1.04]">Documents</h1>
            <p className="m-0 max-w-[46ch] text-[17px] leading-[1.55] text-[#3d4a42]">
              They back up your answers, so we&rsquo;re surer of your value and {who} can check it. Photos are fine. Only you can see them until you choose to share.
            </p>
          </div>
          <div className="flex max-w-[460px] flex-[1_1_340px] items-start gap-3">
            <SarahAvatar />
            <p className="m-0 text-[16px] leading-[1.5]">
              {hasBank
                ? "Your bank statements are in. POS slips, receipts or a stock list would make us surer still."
                : `Start with bank statements: the last six months. They're the first thing ${who} will ask for.`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-x-14 gap-y-10 px-5 pb-16 pt-12 md:px-16">
        <section aria-labelledby="add-title" className="flex flex-col gap-4">
          <h2 id="add-title" className="m-0 text-[24px] font-normal tracking-[-0.02em]">
            Add documents
          </h2>
          <UploadAnswer
            kind={kind}
            docs={[]}
            onAdd={(d) => updateFile((f) => ({ ...f, docs: [...f.docs, ...d] }))}
            onRemove={() => {}}
          />
        </section>

        <section aria-labelledby="have-title" className="flex flex-col gap-2">
          <h2 id="have-title" className="m-0 mb-2 text-[24px] font-normal tracking-[-0.02em]">
            In your file
          </h2>
          {DOC_KINDS.map((k) => {
            const docs = file.docs.filter((d) => d.kind === k.value);
            return (
              <div key={k.value} className="flex flex-col gap-2 border-t border-[#e3e4dc] py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[16px] font-medium">{k.label}</span>
                  <span className="text-[13px] text-[#5d6a61]">{docs.length ? `${docs.length} added` : "None yet"}</span>
                </div>
                <span className="text-[14px] text-[#5d6a61]">{WHY[k.value]}</span>
                {docs.length > 0 && (
                  <ul className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0">
                    {docs.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3 text-[14px]">
                        <span className="min-w-0 truncate">{d.name}</span>
                        <button
                          type="button"
                          onClick={() => updateFile((f) => ({ ...f, docs: f.docs.filter((x) => x.id !== d.id) }))}
                          className="shrink-0 text-[13px] text-[#3d4a42] underline"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          <p className="m-0 mt-3 text-[12px] text-[#7a857c]">Test build: only each file&rsquo;s name and size are saved, on this device.</p>
        </section>
      </div>
    </>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense>
      <Documents />
    </Suspense>
  );
}
