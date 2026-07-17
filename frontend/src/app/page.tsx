import { ArticleAnalysisWorkspace } from "@/components/ArticleAnalysisWorkspace";
import { BackendStatus } from "@/components/BackendStatus";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
      <header className="animate-fade-up mb-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              News intelligence
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
              ArticleIQ
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Paste a story. Get a clear summary, sentiment, keywords, and entities —
              then ask questions grounded in the article.
            </p>
          </div>
          <BackendStatus />
        </div>
      </header>

      <ArticleAnalysisWorkspace />
    </main>
  );
}
