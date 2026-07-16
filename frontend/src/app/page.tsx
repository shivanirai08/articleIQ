import { BackendStatus } from "@/components/BackendStatus";
import { LlmDemoForm } from "@/components/LlmDemoForm";
import { PreprocessArticleForm } from "@/components/PreprocessArticleForm";
import { TokenizeArticleForm } from "@/components/TokenizeArticleForm";
import { ValidateArticleForm } from "@/components/ValidateArticleForm";
import { apiBaseUrl } from "@/lib/config";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
          ArticleIQ · Checkpoint 9
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Intelligent News Summarization &amp; Sentiment Analysis
        </h1>
        <p className="text-base leading-relaxed text-[var(--muted)]">
          Interactive web interface for NLP preprocessing, summaries, sentiment,
          keywords, entities, and article Q&amp;A. Feature panels arrive in later
          checkpoints — preprocessing, spaCy, and Grok/Groq LLM.
        </p>
      </header>

      <BackendStatus />

      <LlmDemoForm />

      <TokenizeArticleForm />

      <PreprocessArticleForm />

      <ValidateArticleForm />

      <section className="rounded-xl border border-[var(--border)] p-5 text-sm">
        <h2 className="font-semibold">Configuration</h2>
        <p className="mt-2 text-[var(--muted)]">
          API base URL:{" "}
          <code className="rounded bg-[var(--accent-muted)]/50 px-1.5 py-0.5 font-mono text-xs">
            {apiBaseUrl}
          </code>
        </p>
        <p className="mt-2 text-[var(--muted)]">
          Set via{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_API_BASE_URL</code> in{" "}
          <code className="font-mono text-xs">frontend/.env.local</code>
        </p>
      </section>

      <section className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">Coming next</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Checkpoint 10 — Summarization API</li>
          <li>Checkpoint 16 — full article analysis UI</li>
        </ul>
      </section>
    </main>
  );
}
