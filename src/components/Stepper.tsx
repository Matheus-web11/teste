import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { highlightC } from "../lib/highlight";
import { BOOT_LINES, INITIAL_SNAP, MAIN_LINES, STEPS } from "../data/trace";
import type { ContaState, Tone } from "../data/trace";

const TONE_CHIP: Record<Tone, string> = {
  pub: "border-pub/40 bg-pub/10 text-pub",
  priv: "border-priv/40 bg-priv/10 text-priv",
  enc: "border-steel/40 bg-steel/10 text-steel",
  mem: "border-mem/40 bg-mem/10 text-mem",
  ret: "border-ok/40 bg-ok/10 text-ok",
};

const KIND_CLS: Record<string, string> = {
  ok: "text-ok",
  err: "text-err",
  info: "text-mist",
  warn: "text-priv",
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function RetBadge({ ret }: { ret: "1" | "0" | "ptr" | "vazio" }) {
  const map = {
    "1": "border-ok/40 bg-ok/10 text-ok",
    "0": "border-err/40 bg-err/10 text-err",
    ptr: "border-pub/40 bg-pub/10 text-pub",
    vazio: "border-steel/30 bg-steel/5 text-steel",
  } as const;
  const label = { "1": "retorna 1", "0": "retorna 0", ptr: "retorna ponteiro", vazio: "void" } as const;
  return (
    <span className={cn("rounded-md border px-2 py-0.5 font-mono text-[11px]", map[ret])}>
      {label[ret]}
    </span>
  );
}

function AccountCard({ name, st }: { name: string; st: ContaState }) {
  const base =
    "rounded-xl border px-3.5 py-3 transition-colors duration-300 min-h-[104px] flex flex-col";
  if (st.status === "inexistente") {
    return (
      <div className={cn(base, "border-line-soft border-dashed bg-transparent opacity-60")}>
        <span className="font-mono text-[11px] text-dim">{name}</span>
        <span className="mt-auto font-display text-lg text-dim">—</span>
        <span className="mt-0.5 text-[11px] text-dim">ainda não declarada</span>
      </div>
    );
  }
  if (st.status === "nula") {
    return (
      <div className={cn(base, "border-steel/25 bg-steel/5")}>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-steel/80">
          <i className="h-1.5 w-1.5 rounded-full bg-steel/50" />
          {name}
        </span>
        <span className="mt-auto font-mono text-lg text-steel">NULL</span>
        <span className="mt-0.5 text-[11px] text-steel/60">aponta para nada</span>
      </div>
    );
  }
  if (st.status === "liberada") {
    return (
      <div className={cn(base, "border-mem/30 bg-mem/5")}>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-mem/90">
          <i className="h-1.5 w-1.5 rounded-full bg-mem" />
          {name}
        </span>
        <span className="mt-auto font-mono text-lg text-mem">free()</span>
        <span className="mt-0.5 text-[11px] text-mem/70">memória devolvida · ptr = NULL</span>
      </div>
    );
  }
  return (
    <div className={cn(base, "border-pub/30 bg-ink-850")}>
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-mist">
          <i className="h-1.5 w-1.5 rounded-full bg-pub pulse-dot" />
          {name}
        </span>
        <span className="font-mono text-[10px] text-pub/70">heap</span>
      </span>
      <div className="mt-auto">
        <div className="font-display text-lg leading-none text-fog">nº {st.num}</div>
        <div className="mt-1.5 font-mono text-[13px] text-pub tabular-nums">
          R$ {fmt(st.saldo)}
        </div>
        <div className="mt-0.5 text-[11px] text-dim">{st.ops} ops no log</div>
      </div>
    </div>
  );
}

export default function Stepper() {
  const [idx, setIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const consoleRef = useRef<HTMLDivElement | null>(null);

  const last = STEPS.length - 1;
  const snap = idx === -1 ? INITIAL_SNAP : STEPS[idx].snap;
  const step = idx === -1 ? null : STEPS[idx];

  const consoleLines = [
    ...BOOT_LINES.map((c, i) => ({ n: -1 - i, ...c })),
    ...STEPS.slice(0, idx + 1).flatMap((s, i) =>
      (s.console ?? []).map((c, j) => ({ n: i * 2, j, ...c }))
    ),
  ];

  useEffect(() => {
    if (playing) {
      if (idx >= last) {
        setPlaying(false);
        return;
      }
      const t = setTimeout(() => setIdx((i) => Math.min(i + 1, last)), 520);
      return () => clearTimeout(t);
    }
  }, [playing, idx, last]);

  useEffect(() => {
    const activeLine = MAIN_LINES.findIndex((l) => l.step === idx);
    if (activeLine >= 0) {
      lineRefs.current[activeLine]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [idx]);

  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [idx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        setIdx((i) => Math.min(i + 1, last));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlaying(false);
        setIdx((i) => Math.max(i - 1, -1));
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [last]);

  const next = () => {
    setPlaying(false);
    setIdx((i) => Math.min(i + 1, last));
  };
  const prev = () => {
    setPlaying(false);
    setIdx((i) => Math.max(i - 1, -1));
  };
  const reset = () => {
    setPlaying(false);
    setIdx(-1);
  };
  const playAll = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    setIdx((i) => (i >= last ? -1 : i));
    setPlaying(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink-900/70">
      {/* barra de controle */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line-soft bg-ink-850 px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-dim">simulador</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={reset}
            title="Reiniciar"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-ink-800 text-mist transition hover:border-steel/40 hover:text-fog"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </button>
          <button
            onClick={prev}
            disabled={idx < 0}
            title="Passo anterior (←)"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-ink-800 text-mist transition hover:border-steel/40 hover:text-fog disabled:opacity-35"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5h2v14H6zM20 5v14L9.5 12z" />
            </svg>
          </button>
          <button
            onClick={next}
            disabled={idx >= last}
            title="Próximo passo (→)"
            className="grid h-9 place-items-center rounded-lg bg-pub px-4 font-display text-[13px] font-semibold text-ink-950 transition hover:bg-pub/85 disabled:opacity-35"
          >
            {idx === -1 ? "Iniciar" : idx >= last ? "fim" : "Próximo"}
          </button>
          <button
            onClick={playAll}
            title="Executar tudo"
            className={cn(
              "grid h-9 place-items-center rounded-lg border px-3 font-display text-[13px] font-semibold transition",
              playing
                ? "border-priv/50 bg-priv/15 text-priv"
                : "border-line bg-ink-800 text-mist hover:border-priv/50 hover:text-priv"
            )}
          >
            {playing ? "Pausar" : "Executar tudo"}
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden h-1.5 w-36 overflow-hidden rounded-full bg-ink-700 sm:block">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pub to-priv transition-all duration-500"
              style={{ width: `${((idx + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[12px] tabular-nums text-mist">
            {idx + 1} / {STEPS.length}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-12">
        {/* código */}
        <div className="lg:col-span-5">
          <div className="flex h-full min-h-[300px] flex-col overflow-hidden rounded-xl border border-line-soft bg-ink-950/70">
            <div className="flex items-center justify-between border-b border-line-soft px-3.5 py-2">
              <span className="font-mono text-[11.5px] text-mist">apps.c</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
                linha a linha
              </span>
            </div>
            <div className="max-h-[560px] flex-1 overflow-y-auto py-2">
              {MAIN_LINES.map((l, i) => {
                const isCur = l.step === idx;
                const isPast = l.step !== undefined && l.step < idx;
                const isFuture = l.step !== undefined && l.step > idx;
                const st = l.step !== undefined ? STEPS[l.step] : null;
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      lineRefs.current[i] = el;
                    }}
                    className={cn(
                      "flex items-center gap-2 border-l-2 px-2.5 py-[1.5px] font-mono text-[11.8px] leading-[1.65] transition-colors duration-200",
                      isCur
                        ? "border-priv bg-priv/10 text-fog"
                        : "border-transparent",
                      isFuture ? "text-[#46586f]" : "text-[#aebdcc]"
                    )}
                  >
                    <span className="w-6 shrink-0 select-none text-right text-[10px] text-[#3b4d63]">
                      {i + 1}
                    </span>
                    <span className="whitespace-pre pr-1">{highlightC(l.text)}</span>
                    {st && isPast && (
                      <span
                        className={cn(
                          "ml-auto grid h-4 w-4 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold",
                          st.ret === "1" && "bg-ok/15 text-ok",
                          st.ret === "0" && "bg-err/15 text-err",
                          st.ret === "ptr" && "bg-pub/15 text-pub",
                          st.ret === "vazio" && "bg-steel/10 text-steel/70"
                        )}
                      >
                        {st.ret === "vazio" ? "·" : st.ret === "ptr" ? "p" : st.ret}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* estado */}
        <div className="flex flex-col gap-3.5 lg:col-span-7">
          <div className="grid grid-cols-3 gap-3">
            <AccountCard name="c1" st={snap.c1} />
            <AccountCard name="c2" st={snap.c2} />
            <AccountCard name="cNULL" st={snap.cNULL} />
          </div>

          {/* detalhe do passo */}
          <div
            key={idx}
            className={cn(
              "step-in rounded-xl border bg-ink-850/80 p-4",
              step ? "border-line" : "border-line-soft border-dashed"
            )}
          >
            {step ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-dim">
                    passo {idx}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                      TONE_CHIP[step.tone]
                    )}
                  >
                    {step.concept}
                  </span>
                  <span className="ml-auto">
                    <RetBadge ret={step.ret} />
                  </span>
                </div>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-fog/90">{step.action}</p>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pub pulse-dot" />
                <p className="text-[13.5px] text-mist">
                  Sistema pronto. Pressione <strong className="text-fog">Iniciar</strong> (ou →) e
                  acompanhe o <code className="font-mono text-[12.5px] text-pub">main()</code> linha
                  a linha — saldos, retornos 1/0 e o console reagem juntos.
                </p>
              </div>
            )}
          </div>

          {/* console */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line-soft bg-ink-950/80">
            <div className="flex items-center gap-2 border-b border-line-soft px-3.5 py-2">
              <span className="font-mono text-[11.5px] text-mist">console</span>
              <span className="font-mono text-[10px] text-dim">saída ilustrativa do TAD</span>
            </div>
            <div ref={consoleRef} className="h-44 overflow-y-auto px-3.5 py-2.5 font-mono text-[11.8px] leading-[1.8]">
              {consoleLines.map((c, i) => (
                <div key={i} className={cn("step-in flex gap-2", KIND_CLS[c.kind])}>
                  <span className="select-none text-dim">»</span>
                  <span className="whitespace-pre-wrap break-words">{c.text}</span>
                </div>
              ))}
              <div className="mt-0.5 flex gap-2 text-dim">
                <span>»</span>
                <span className="blink inline-block h-3.5 w-2 translate-y-0.5 bg-mist/70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
