"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { GlossaryTerm } from "@/lib/content-types"
import { Search } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

export function GlossaryBrowser({
  terms,
  moduleSlugs,
}: {
  terms: GlossaryTerm[]
  moduleSlugs: Record<number, string>
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("All")

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(terms.map((t) => t.category))).sort()],
    [terms],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return terms
      .filter((t) => category === "All" || t.category === category)
      .filter(
        (t) =>
          !q ||
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q),
      )
      .sort((a, b) => a.term.localeCompare(b.term))
  }, [terms, query, category])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms, e.g. angle of attack"
            aria-label="Search the glossary"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-muted-foreground font-mono text-xs" aria-live="polite">
          {filtered.length} term{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {filtered.map((term) => (
          <div key={term.id} className="glass flex flex-col gap-2 rounded-xl p-5">
            <div className="flex flex-wrap items-center gap-2">
              <dt className="font-semibold tracking-tight">{term.term}</dt>
              <Badge variant="outline">{term.category}</Badge>
            </div>
            <dd className="flex flex-col gap-2">
              <p className="text-sm leading-relaxed">{term.definition}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                <span className="text-accent font-medium">Why it matters: </span>
                {term.whyItMatters}
              </p>
              {term.moduleId != null && moduleSlugs[term.moduleId] && (
                <Link
                  href={`/course/${moduleSlugs[term.moduleId]}`}
                  className="text-accent text-sm font-medium"
                >
                  Taught in module {term.moduleId}
                </Link>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {filtered.length === 0 && (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No terms match that search. Try a shorter phrase.
        </p>
      )}
    </div>
  )
}
