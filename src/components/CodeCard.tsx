import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { highlightC } from "../lib/highlight";

type Tone = "pub" | "priv" | "app" | "sh" | "mem";

const TONE_TAG: Record<Tone, string> = {
  pub: "border-pub/30 bg-pub/10 text-pub",
  priv: "border-priv/30 bg-priv/10 text-priv",
  app: "border-steel/25 bg-steel/10 text-steel",
  sh: "border-ok/30 bg-ok/10 text-ok",
  mem: "border-mem/30 bg-mem/10 text-mem",
};

interface CodeCardProps {
  file: string;
  tone?: Tone;
  tag?: string;
  code: string;
  plain?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function CodeCard({
  file,
  tone = "app",
  tag,
  code,
  plain = false,
  className,
  children,
}: CodeCardProps) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className={cn("overflow-hidden rounded-xl border border-line bg-ink-900/80", className)}>
      <figcaption className="flex items-center gap-3 border-b border-line-soft bg-ink-850 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <i className="h-2.5 w-2.5 rounded-full bg-[#3a4a5f]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#3a4a5f]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#3a4a5f]" />
        </span>
        <span className="font-mono text-[12.5px] text-mist">{file}</span>
        {tag && (
          <span
            className={cn(
              "ml-auto rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider",
              TONE_TAG[tone]
            )}
          >
            {tag}
          </span>
        )}
      </figcaption>
      <div className="overflow-x-auto px-1 py-3">
        <pre className="min-w-max font-mono text-[12.75px] leading-[1.75] text-[#dce4ee]">
          {lines.map((ln, i) => (
            <div key={i} className="flex">
              <span className="w-10 shrink-0 select-none pr-3 text-right text-[#3d4f66]">
                {i + 1}
              </span>
              <span className="whitespace-pre pr-4">
                {plain ? ln : highlightC(ln)}
              </span>
            </div>
          ))}
        </pre>
      </div>
      {children && <div className="border-t border-line-soft px-4 py-3.5">{children}</div>}
    </figure>
  );
}
