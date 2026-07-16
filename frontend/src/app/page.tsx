import { ArticleAnalysisWorkspace } from "@/components/ArticleAnalysisWorkspace";
import { BackendStatus } from "@/components/BackendStatus";
import { DevToolsPanel } from "@/components/DevToolsPanel";
import { apiBaseUrl } from "@/lib/config";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12 sm:py-16">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
          ArticleIQ · Checkpoint 16
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Intelligent News Analysis
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          Paste a news article to get an AI-powered summary, sentiment, keywords, and
          named entities — then ask grounded questions about the same story.
        </p>
      </header>

      <BackendStatus />

      <ArticleAnalysisWorkspace />

      <section className="rounded-xl border border-[var(--border)] p-5 text-sm">
        <h2 className="font-semibold">Configuration</h2>
        <p className="mt-2 text-[var(--muted)]">
          API base URL:{" "}
          <code className="rounded bg-[var(--accent-muted)]/50 px-1.5 py-0.5 font-mono text-xs">
            {apiBaseUrl}
          </code>
        </p>
      </section>

      <DevToolsPanel />

      <section className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">Coming next</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Checkpoint 17 — testing and hardening</li>
          <li>Checkpoint 18 — deployment and presentation pack</li>
        </ul>
      </section>
    </main>
  );
}
