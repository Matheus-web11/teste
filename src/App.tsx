import { BarraTopo, Lateral, useSecaoAtiva } from './components/Navegacao';
import { Parte } from './components/Topico';
import { Abertura } from './secoes/Abertura';
import { Parte1 } from './secoes/Parte1';
import { Parte2 } from './secoes/Parte2';
import { Resumo } from './secoes/Resumo';

export default function App() {
  const ativa = useSecaoAtiva();

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-papel focus:px-4 focus:py-2 focus:font-semibold"
      >
        Pular para o conteúdo
      </a>

      <BarraTopo ativa={ativa} />

      <div className="mx-auto flex max-w-[80rem] items-start lg:gap-8 lg:px-6">
        <Lateral ativa={ativa} />

        <div className="min-w-0 flex-1 md:px-6 md:py-6 lg:px-0 lg:py-8">
          <main id="conteudo" className="folha mx-auto max-w-[58rem]">
            <Abertura />
            <Parte n={1} descricao="Sete tópicos sobre como o tipo se divide entre o que promete e o que esconde." />
            <Parte1 />
            <Parte n={2} descricao="Seis perguntas sobre o que é guardado, onde fica e quem tem permissão de mexer." />
            <Parte2 />
            <Resumo />
          </main>

          <footer className="sobre-mesa mx-auto max-w-[58rem] px-5 py-8 text-[0.875rem] leading-[1.6] text-claro-2 md:px-0">
            <p className="max-w-[62ch]">
              Página montada a partir dos quatro arquivos enviados para a atividade. O que não veio no código está
              marcado como esperado, esboço ou ilustração.
            </p>
            <p className="mt-3">
              <a href="#topo" className="font-semibold text-claro underline decoration-white/35 underline-offset-4 hover:decoration-white">
                Voltar ao início
              </a>
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
