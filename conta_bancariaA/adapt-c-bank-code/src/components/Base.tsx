import { Fragment, useState, type ReactNode } from 'react';
import { cn } from '../utils/cn';

/* Código no meio do texto. Cada palavra fica inteira na linha: a quebra só acontece
   nos espaços, nunca depois de um hífen (-Wall, conta->saldo). */
export function C({ children }: { children: ReactNode }) {
  if (typeof children !== 'string') return <code className="cod">{children}</code>;
  return (
    <code className="cod">
      {children.split(' ').map((palavra, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="whitespace-nowrap">{palavra}</span>
        </Fragment>
      ))}
    </code>
  );
}

/* Caminho de arquivo que, se precisar quebrar, quebra depois da barra. */
export function Caminho({ children }: { children: string }) {
  const partes = children.split('/');
  return (
    <>
      {partes.map((parte, i) => (
        <Fragment key={i}>
          {parte}
          {i < partes.length - 1 && (
            <>
              /<wbr />
            </>
          )}
        </Fragment>
      ))}
    </>
  );
}

/* Texto corrido: `crases` viram código, **asteriscos** viram negrito. */
export function rico(texto: string): ReactNode[] {
  return texto.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((parte, i) => {
    if (parte.length > 2 && parte.startsWith('`') && parte.endsWith('`')) {
      return <C key={i}>{parte.slice(1, -1)}</C>;
    }
    if (parte.length > 4 && parte.startsWith('**') && parte.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {parte.slice(2, -2)}
        </strong>
      );
    }
    return parte;
  });
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('max-w-[66ch] text-pretty', className)}>
      {typeof children === 'string' ? rico(children) : children}
    </p>
  );
}

export function Sub({ children, marca }: { children: string; marca?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-3">
      <h4 className="font-cond text-[1.3125rem] font-semibold leading-tight sm:text-[1.5rem]">{rico(children)}</h4>
      {marca}
    </div>
  );
}

type Tom = 'verde' | 'neutro' | 'vermelho';

export function Etiqueta({ tom = 'neutro', children }: { tom?: Tom; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-block border px-1.5 py-[0.1875rem] font-cond text-[0.75rem] font-semibold leading-none tracking-[0.03em] whitespace-nowrap',
        tom === 'verde' && 'border-forma bg-forma text-white',
        tom === 'neutro' && 'border-dashed border-tinta-3 text-tinta-2',
        tom === 'vermelho' && 'border-erro bg-erro text-white',
      )}
    >
      {children}
    </span>
  );
}

/* As duas marcas de certeza usadas na página inteira. */
export const Visto = () => <Etiqueta tom="verde">visto no código</Etiqueta>;
export const Esperado = () => <Etiqueta>esperado pelo .h</Etiqueta>;

export function EmUmaFrase({ children }: { children: string }) {
  return (
    <div className="total border-t border-forma/45 pt-3 pb-4">
      <p className="rotulo text-forma">Em uma frase</p>
      <p className="mt-2 max-w-[60ch] text-[1.1875rem] leading-[1.5] text-pretty sm:text-[1.3125rem]">
        {rico(children)}
      </p>
    </div>
  );
}

export function Nota({
  rotulo,
  tom = 'neutro',
  children,
}: {
  rotulo: string;
  tom?: 'neutro' | 'vermelho';
  children: ReactNode;
}) {
  return (
    <aside
      className={cn(
        'border px-4 py-3.5 sm:px-5 sm:py-4',
        tom === 'vermelho' ? 'border-erro/55 bg-erro-faixa/45' : 'border-dashed border-tinta-3/70',
      )}
    >
      <p className={cn('rotulo', tom === 'vermelho' ? 'text-erro' : 'text-tinta-2')}>{rotulo}</p>
      <div className="mt-2 max-w-[66ch] space-y-2 text-[0.9375rem] leading-[1.6]">
        {typeof children === 'string' ? <p>{rico(children)}</p> : children}
      </div>
    </aside>
  );
}

/* Lista numerada; os números casam com as marcas da listagem logo acima. */
export function Notas({ itens }: { itens: string[] }) {
  return (
    <ol className="max-w-[68ch] space-y-3">
      {itens.map((item, i) => (
        <li key={i} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3">
          <span className="marca mt-[0.2rem]" aria-hidden="true">
            {i + 1}
          </span>
          <span>
            <span className="sr-only">Nota {i + 1}: </span>
            {rico(item)}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Itens({ itens }: { itens: string[] }) {
  return (
    <ul className="max-w-[66ch] space-y-3">
      {itens.map((item, i) => (
        <li key={i} className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-3">
          <span className="mt-[0.6em] size-2 bg-forma" aria-hidden="true" />
          <span>{rico(item)}</span>
        </li>
      ))}
    </ul>
  );
}

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = texto;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

function LinhaTerminal({ texto }: { texto: string }) {
  const comando = /^(\$|\(gdb\)) (.*)$/.exec(texto);
  if (comando) {
    return (
      <div className="term-l">
        <span className="text-[#86d3a3] select-none">{comando[1]} </span>
        {comando[2]}
      </div>
    );
  }
  return <div className="term-l text-claro-2">{texto}</div>;
}

/* Bloco de terminal. Linhas com "$ " são comandos (e entram no botão de copiar);
   "(gdb) " são comandos do depurador; o resto é saída ou comentário. */
export function Terminal({ linhas, rotulo = 'Terminal' }: { linhas: string[]; rotulo?: string }) {
  const comandos = linhas
    .filter((l) => l.startsWith('$ '))
    .map((l) => l.slice(2))
    .join('\n');
  const [estado, setEstado] = useState<'parado' | 'copiado' | 'falhou'>('parado');

  async function aoCopiar() {
    const ok = await copiarTexto(comandos);
    setEstado(ok ? 'copiado' : 'falhou');
    window.setTimeout(() => setEstado('parado'), 1800);
  }

  return (
    <div className="sobre-mesa bg-terminal text-claro">
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-white/10 pr-1.5 pl-3.5 sm:pl-4">
        <span className="rotulo text-claro-2">{rotulo}</span>
        {comandos !== '' && (
          <button
            type="button"
            onClick={aoCopiar}
            className="h-10 px-2.5 font-cond text-[0.8125rem] font-semibold tracking-[0.04em] text-claro underline decoration-white/35 underline-offset-4 hover:decoration-white"
          >
            {estado === 'copiado' ? 'Copiado' : estado === 'falhou' ? 'Não copiou' : 'Copiar comandos'}
          </button>
        )}
        <span className="sr-only" aria-live="polite">
          {estado === 'copiado' ? 'Comandos copiados' : ''}
        </span>
      </div>
      <div className="px-3.5 py-3 font-mono text-[0.8125rem] leading-[1.7] [font-variant-ligatures:none] sm:px-4">
        {linhas.map((linha, i) => (
          <LinhaTerminal key={i} texto={linha} />
        ))}
      </div>
    </div>
  );
}

export function SetaDireita({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 10"
      className={cn('h-2.5 w-4 shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M0 5h14M10 1l4.5 4-4.5 4" />
    </svg>
  );
}

export function IconeOk({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn('size-4 shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M2.5 8.5 6.5 12.5 13.5 4" />
    </svg>
  );
}

export function IconeX({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn('size-4 shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" />
    </svg>
  );
}
