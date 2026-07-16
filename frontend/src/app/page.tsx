import { ArticleAnalysisWorkspace } from "@/components/ArticleAnalysisWorkspace";
import { BackendStatus } from "@/components/BackendStatus";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">ArticleIQ</h1>
          <p className="text-sm text-[var(--muted)]">
            Summarize news, detect sentiment, extract keywords &amp; entities, and ask
            questions — powered by NLP and LLMs.
          </p>
        </div>
        <BackendStatus />
      </header>

      <ArticleAnalysisWorkspace />
    </main>
  );
}
