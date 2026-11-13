import { Esperado, Itens, Notas, P, Sub, Visto } from '../components/Base';
import { ExecucaoMain } from '../components/ExecucaoMain';
import {
  AnatomiaChamada,
  CamposDaConta,
  CicloDeVida,
  EfeitosDasFuncoes,
  GradeLog,
  PilhaHeap,
  RegistroExemplo,
  TabelaParametros,
  TiposVisiveis,
} from '../components/FigurasParte2';
import { Listagem } from '../components/Listagem';
import { Topico } from '../components/Topico';

/* O corpo de cb_excluir não veio no código enviado. Este esboço é o comportamento
   mínimo que faz o final do main funcionar; foi compilado e testado com o main. */
const ESBOCO_EXCLUIR = [
  'void cb_excluir(struct ContaBancaria **conta)',
  '{',
  '    if (conta == NULL || *conta == NULL)',
  '        return;',
  '    free(*conta);',
  '    *conta = NULL;',
  '}',
].join('\n');

/* Parte 2 do roteiro: tipos de dados/dados (tópicos 8 a 13). */
export function Parte2() {
  return (
    <>
      <Topico n={8}>
        <TiposVisiveis />
        <P>
          {
            'A regra para conferir é simples: se o nome não está no `.h`, nem em algo que o `.h` inclua, o `main` não enxerga. Repare que `struct ContaBancaria` aparece nas duas colunas: o nome é público, o conteúdo é interno. É essa divisão que sustenta o encapsulamento do tópico 6.'
          }
        </P>
      </Topico>

      <Topico n={9}>
        <PilhaHeap />

        <Sub marca={<Visto />}>Alocação</Sub>
        <Notas
          itens={[
            '`cb_criar(521, 100)` chama `malloc(sizeof(struct ContaBancaria))` na linha 39 do `.c`: um bloco só para a conta inteira, histórico incluído.',
            'Se `malloc` falhar, a função avisa e devolve `NULL` (linhas 40 a 44).',
            'O endereço volta para o `main` e é guardado em `c1`. O ponteiro é variável local e mora na pilha; a conta mora no heap e sobrevive ao fim de `cb_criar`.',
          ]}
        />

        <Sub marca={<Esperado />}>Liberação</Sub>
        <P>
          {
            '`cb_excluir(&c1)` recebe o endereço do ponteiro, não o ponteiro: o parâmetro é `struct ContaBancaria **`. É o que permite fazer as duas coisas de uma exclusão segura: devolver o bloco com `free` e gravar `NULL` na variável `c1`, lá no `main`.'
          }
        </P>
        <Listagem
          arquivo="esboço de cb_excluir"
          papel="não é o código enviado"
          texto={ESBOCO_EXCLUIR}
          faixas={[5, 6]}
        />
        <P>
          {
            'Esse desenho explica o final do `main`. Na linha 41, `cb_excluir(&cNULL)` não encontra nada para liberar. Na linha 42, o segundo `cb_excluir(&c1)` encontra `c1` já em `NULL` e também não faz nada. Se a função recebesse só `struct ContaBancaria *`, `c1` continuaria guardando um endereço morto e a segunda chamada tentaria liberar o mesmo bloco de novo.'
          }
        </P>
        <P>
          {
            'Para quem usa a biblioteca sobra uma regra: cada `cb_criar` pede um `cb_excluir`. A linha 38, comentada, é o contraexemplo: se voltar a valer, cria uma conta que ninguém exclui e 2012 bytes ficam perdidos. O tópico 7 mostra como flagrar isso.'
          }
        </P>
      </Topico>

      <Topico n={10}>
        <CamposDaConta />
        <div className="grid gap-5 @2xl:grid-cols-2 @2xl:items-start">
          <GradeLog />
          <RegistroExemplo />
        </div>
        <Sub>O que essa organização implica</Sub>
        <Itens
          itens={[
            '**Um bloco só.** O histórico é um vetor dentro da struct, não um ponteiro para outro lugar: nasce e termina junto com a conta, no mesmo `malloc` e no mesmo `free`.',
            '**Capacidade fixa.** São 100 registros por conta, usados ou não; é por isso que uma conta ocupa 2012 bytes. A 101ª operação não cabe: quem grava no histórico precisa conferir se `pos_log` ainda é menor que `MAX_OPERACOES`.',
            '**O tipo da operação é um inteiro.** O campo `tipo` guarda um dos valores de `enum TipoOperacao`, mas foi declarado como `int` comum.',
            '**Dinheiro em ponto flutuante.** Um `float` guarda cerca de 7 algarismos significativos. Na linha 29 do `main` o saldo de `c2` chega a 239943.64, que dentro do `float` fica 239943.640625. Com duas casas a diferença não aparece, mas ela existe e cresce com valores maiores.',
          ]}
        />
      </Topico>

      <Topico n={11}>
        <CicloDeVida />
        <P>
          {
            'Quem fica de fora: o `main`, que só guarda ponteiros e faz chamadas, e `ec_imprimirCor`, que imprime texto colorido e nunca recebe uma conta.'
          }
        </P>
      </Topico>

      <Topico n={12}>
        <EfeitosDasFuncoes />
        <P>
          {
            'Pelos campos de `struct Operacao`, cada operação também deve deixar um registro em `log` e avançar `pos_log`. O código que faz isso não veio.'
          }
        </P>
        <Sub>{'O `main`, linha a linha'}</Sub>
        <P>
          {
            'Avance pelas 27 instruções do `main` e veja, em cada uma, o que entra, o que volta e como ficam as contas. As regras de recusa são as da lista acima.'
          }
        </P>
        <ExecucaoMain />
        <P>
          {
            'No fim, a conta 521 termina com 250.00 e a 1023 com 39843.64. Depois das quatro chamadas a `cb_excluir`, não sobra nenhum bloco no heap.'
          }
        </P>
      </Topico>

      <Topico n={13}>
        <AnatomiaChamada />
        <Sub>Função por função</Sub>
        <TabelaParametros />
        <Sub>Quatro detalhes que valem citar</Sub>
        <Itens
          itens={[
            '**Conversão na chamada.** `100` e `30000` são literais `int`; `14351.89` é `double`. Como o protótipo pede `float`, o compilador converte sozinho, e o `double` perde precisão: 14351.89 entra como 14351.8896484375.',
            '**Tudo é passado por valor.** C sempre copia o argumento. Em `cb_depositar(c1, 100)` a cópia é do endereço: a função alcança a conta, mas não consegue mudar a variável `c1`. Em `cb_excluir(&c1)` o argumento é o endereço de `c1`, e aí a função consegue.',
            '**Retorno usado como verdadeiro ou falso.** Na linha 21, `if (!cb_transferir(c2, c1, -100))`: a função devolve 0, `!0` é verdadeiro e o `main` imprime o aviso. É o único ponto em que o `main` olha o retorno; nas outras chamadas o 1 ou 0 é descartado, o que C permite.',
            '**NULL como aviso de erro.** `cb_criar` devolve `NULL` quando falta memória, e o `main` enviado não confere `c1` nem `c2` depois de criar. Quem segura o programa nesse caso é o teste de `NULL` que cada função `cb_` precisa ter, o mesmo que as chamadas com `cNULL` exercitam.',
          ]}
        />
      </Topico>
    </>
  );
}
