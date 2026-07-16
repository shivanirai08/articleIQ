"use client";

import { useState } from "react";

import { AnalyzeArticleForm } from "@/components/AnalyzeArticleForm";
import { EntitiesArticleForm } from "@/components/EntitiesArticleForm";
import { KeywordsArticleForm } from "@/components/KeywordsArticleForm";
import { LlmDemoForm } from "@/components/LlmDemoForm";
import { PreprocessArticleForm } from "@/components/PreprocessArticleForm";
import { QAArticleForm } from "@/components/QAArticleForm";
import { SentimentArticleForm } from "@/components/SentimentArticleForm";
import { SummarizeArticleForm } from "@/components/SummarizeArticleForm";
import { TokenizeArticleForm } from "@/components/TokenizeArticleForm";
import { ValidateArticleForm } from "@/components/ValidateArticleForm";

/** Collapsible per-endpoint demos from earlier checkpoints. */
export function DevToolsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-dashed border-[var(--border)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold"
        aria-expanded={open}
      >
        Developer API demos (Checkpoints 6–15)
        <span className="text-[var(--muted)]">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="space-y-6 border-t border-[var(--border)] px-5 py-5">
          <AnalyzeArticleForm />
          <SummarizeArticleForm />
          <SentimentArticleForm />
          <KeywordsArticleForm />
          <EntitiesArticleForm />
          <QAArticleForm />
          <LlmDemoForm />
          <TokenizeArticleForm />
          <PreprocessArticleForm />
          <ValidateArticleForm />
        </div>
      )}
    </section>
  );
}
