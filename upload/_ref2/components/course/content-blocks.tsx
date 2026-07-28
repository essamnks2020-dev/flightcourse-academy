import type { ContentBlock } from "@/lib/content-types"
import { Info, Lightbulb, Radar, TriangleAlert } from "lucide-react"

const calloutStyles = {
  info: {
    icon: Info,
    wrapper: "border-accent/40 bg-accent/8",
    iconClass: "text-accent",
  },
  warning: {
    icon: TriangleAlert,
    wrapper: "border-destructive/40 bg-destructive/8",
    iconClass: "text-destructive",
  },
  tip: {
    icon: Lightbulb,
    wrapper: "border-primary/40 bg-primary/8",
    iconClass: "text-primary",
  },
} as const

function humanise(key: string) {
  return key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className="leading-relaxed text-pretty">
                {block.text}
              </p>
            )

          case "heading":
            return (
              <h3
                key={i}
                className="mt-3 text-lg font-semibold tracking-tight text-balance"
              >
                {block.text}
              </h3>
            )

          case "list": {
            const items = block.items.map((item, j) => (
              <li key={j} className="leading-relaxed">
                {item}
              </li>
            ))
            return block.ordered ? (
              <ol
                key={i}
                className="marker:text-primary flex list-decimal flex-col gap-2 pl-5 marker:font-mono marker:text-sm"
              >
                {items}
              </ol>
            ) : (
              <ul
                key={i}
                className="marker:text-primary flex list-disc flex-col gap-2 pl-5"
              >
                {items}
              </ul>
            )
          }

          case "callout": {
            const style = calloutStyles[block.variant]
            return (
              <aside
                key={i}
                className={`flex gap-3 rounded-xl border p-4 ${style.wrapper}`}
              >
                <style.icon
                  className={`mt-0.5 size-4 shrink-0 ${style.iconClass}`}
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">{block.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {block.body}
                  </p>
                </div>
              </aside>
            )
          }

          case "diagram":
            return (
              <figure
                key={i}
                className="glass flex flex-col gap-3 rounded-xl p-5"
              >
                <div className="flex items-center gap-2">
                  <Radar className="text-accent size-4" aria-hidden="true" />
                  <span className="label-instrument text-accent">
                    {humanise(block.diagramKey)}
                  </span>
                </div>
                <div
                  className="bg-grid border-border h-32 rounded-lg border"
                  aria-hidden="true"
                />
                <figcaption className="text-muted-foreground text-sm leading-relaxed">
                  {block.caption}
                </figcaption>
              </figure>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
