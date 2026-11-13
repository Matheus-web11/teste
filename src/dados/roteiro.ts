/* Os 13 tópicos, na ordem e com a redação do roteiro da atividade.
   Nos textos, `crases` viram código e **asteriscos** viram negrito. */

export const PARTES: Record<1 | 2, string> = {
  1: 'Tipos abstratos de dados',
  2: 'Tipos de dados/Dados',
};

export type TopicoInfo = {
  n: number;
  id: string;
  parte: 1 | 2;
  titulo: string;
  curto: string;
  frase: string;
  ligados: number[];
};

export const TOPICOS: TopicoInfo[] = [
  {
    n: 1,
    id: 'essencia',
    parte: 1,
    titulo: 'Essência',
    curto: 'Essência',
    frase:
      'Uma conta bancária vira um tipo novo: dados (número, saldo, histórico) que só mudam por meio de seis operações — criar, depositar, sacar, transferir, imprimir e excluir.',
    ligados: [2, 6],
  },
  {
    n: 2,
    id: 'interface-publica',
    parte: 1,
    titulo: 'Interface pública',
    curto: 'Interface pública',
    frase:
      'A interface pública é o arquivo `include/contaBancaria.h`: o nome do tipo e os protótipos das seis funções `cb_`, tudo o que o `main` tem permissão de usar.',
    ligados: [4, 8],
  },
  {
    n: 3,
    id: 'interface-privada',
    parte: 1,
    titulo: 'Interface privada',
    curto: 'Interface privada',
    frase:
      'A interface privada é o que fica só em `src/contaBancaria.c`: a constante `MAX_OPERACOES`, o `enum TipoOperacao`, a `struct Operacao` e os campos da `struct ContaBancaria`.',
    ligados: [6, 8, 10],
  },
  {
    n: 4,
    id: 'especificacao',
    parte: 1,
    titulo: 'Especificação: o que faz?',
    curto: 'Especificação',
    frase:
      'A especificação é o contrato escrito no `.h`: para cada função, o nome, o que recebe, o que devolve e o que promete, sem nenhuma linha de como.',
    ligados: [5, 12, 13],
  },
  {
    n: 5,
    id: 'implementacao',
    parte: 1,
    titulo: 'Implementação: como faz?',
    curto: 'Implementação',
    frase:
      'A implementação é o corpo das funções em `src/contaBancaria.c`. No trecho enviado dá para ver `cb_criar` por dentro: pede memória com `malloc`, confere se deu certo e preenche número e saldo.',
    ligados: [9, 10, 12],
  },
  {
    n: 6,
    id: 'encapsulamento',
    parte: 1,
    titulo: 'Encapsulamento',
    curto: 'Encapsulamento',
    frase:
      'O `main` não consegue ler nem alterar o saldo por conta própria: como o `.h` traz apenas `struct ContaBancaria;`, o compilador recusa qualquer acesso direto aos campos, e só resta pedir às funções `cb_`.',
    ligados: [2, 3, 8],
  },
  {
    n: 7,
    id: 'compilacao',
    parte: 1,
    titulo: 'Diferentes formas de compilação para diferentes cenários de depuração',
    curto: 'Compilação e depuração',
    frase:
      'Como interface e implementação estão em arquivos separados, cada parte é compilada sozinha e depois ligada; mudando as opções do `gcc`, o mesmo código serve para rodar, para acompanhar linha a linha ou para caçar erro de memória.',
    ligados: [5, 9],
  },
  {
    n: 8,
    id: 'tipos',
    parte: 2,
    titulo: 'Quais são os tipos de dados disponibilizados ao usuário e quais são internos à biblioteca?',
    curto: 'Tipos visíveis e internos',
    frase:
      'Para o usuário existe um único tipo novo, `struct ContaBancaria`, e só pelo nome, sempre atrás de um ponteiro; `struct Operacao`, `enum TipoOperacao`, `MAX_OPERACOES` e os próprios campos da conta são internos.',
    ligados: [2, 3, 6],
  },
  {
    n: 9,
    id: 'memoria',
    parte: 2,
    titulo: 'Como ocorre a alocação e a liberação de memória para as variáveis desses tipos?',
    curto: 'Alocação e liberação',
    frase:
      'Toda conta nasce no heap, dentro de `cb_criar`, com `malloc`, e deve terminar em `cb_excluir`, com `free`; o `main` guarda apenas ponteiros e nem conseguiria alocar sozinho, porque não conhece o tamanho do tipo.',
    ligados: [5, 7, 13],
  },
  {
    n: 10,
    id: 'organizacao',
    parte: 2,
    titulo: 'Como os dados são armazenados e organizados?',
    curto: 'Armazenamento',
    frase:
      'Cada conta é um registro com quatro campos em sequência na memória: número, saldo, o contador `pos_log` e um vetor fixo de 100 registros `struct Operacao`. O histórico mora dentro da própria conta.',
    ligados: [3, 9],
  },
  {
    n: 11,
    id: 'funcoes',
    parte: 2,
    titulo: 'Quais funções manipulam esses tipos de dados?',
    curto: 'Funções do tipo',
    frase:
      'Só as seis funções `cb_` do cabeçalho tocam numa `struct ContaBancaria`: uma cria, três alteram, uma mostra e uma destrói.',
    ligados: [4, 12],
  },
  {
    n: 12,
    id: 'o-que-fazem',
    parte: 2,
    titulo: 'O que essas funções realmente fazem?',
    curto: 'O que as funções fazem',
    frase:
      'Elas mudam o estado guardado na conta: criar reserva e preenche o bloco, depositar e sacar somam e subtraem do saldo, transferir faz as duas coisas em contas diferentes, imprimir só lê e excluir devolve a memória.',
    ligados: [5, 13],
  },
  {
    n: 13,
    id: 'parametros',
    parte: 2,
    titulo: 'Parâmetros, argumentos e valores retornados pelas funções?',
    curto: 'Parâmetros e retornos',
    frase:
      'Parâmetro é o nome que aparece na definição da função; argumento é o valor entregue na chamada. Em `c1 = cb_criar(521, 100)`, os argumentos 521 e 100 são copiados para os parâmetros `num` e `saldoInicial`, e o ponteiro devolvido vai para `c1`.',
    ligados: [4, 9, 12],
  },
];

export const pad = (n: number) => String(n).padStart(2, '0');
