import { Etiqueta, Itens, Nota, Notas, P, Sub, Terminal, rico } from '../components/Base';
import {
  Armadilha,
  CasosDeFalha,
  Cenario,
  CompilaNaoCompila,
  ContratoFuncoes,
  MapaArquivos,
} from '../components/FigurasParte1';
import { Listagem } from '../components/Listagem';
import { Topico } from '../components/Topico';
import { FONTES } from '../dados/fontes';

const { cabecalho, cores, biblioteca, principal } = FONTES;

/* Parte 1 do roteiro: tipos abstratos de dados (tópicos 1 a 7). */
export function Parte1() {
  return (
    <>
      <Topico n={1}>
        <P>
          {
            'A essência de um TAD é separar **o que** o tipo oferece de **como** ele é guardado. No seu projeto essa separação é física: cada papel mora em um arquivo.'
          }
        </P>
        <MapaArquivos />
        <P>{'Três linhas do `main` já mostram a ideia inteira:'}</P>
        <Listagem
          arquivo={principal.caminho}
          papel="cliente"
          texto={principal.texto}
          de={7}
          ate={10}
          faixas={[7, 9, 10]}
        />
        <P>
          {
            'O `main` declara só um ponteiro (linha 7), pede a conta à biblioteca (linha 9) e, daí em diante, entrega esse ponteiro às funções `cb_` (linha 10). Em nenhum momento ele escreve `saldo` ou `numero`: esses nomes só existem dentro de `contaBancaria.c`.'
          }
        </P>
      </Topico>

      <Topico n={2}>
        <Listagem
          arquivo={cabecalho.caminho}
          papel="interface pública"
          texto={cabecalho.texto}
          faixas={[4]}
          marcas={{ 1: 1, 4: 2, 6: 3, 11: 4 }}
        />
        <Notas
          itens={[
            'Guarda de inclusão (linhas 1, 2 e 21): se o cabeçalho for incluído duas vezes na mesma compilação, a segunda passada encontra `CONTA_BANCARIA_H` já definido e pula tudo.',
            'Declaração incompleta: avisa que o tipo `struct ContaBancaria` existe, sem mostrar um campo sequer. É tudo o que o usuário recebe sobre o tipo.',
            'Seis protótipos, das linhas 6 a 19. O prefixo `cb_` funciona como sobrenome da biblioteca: C não tem namespaces, então o prefixo evita choque com nomes de outros arquivos.',
            'Os comentários fazem parte do contrato: explicam o que significa o `int` devolvido.',
          ]}
        />
        <Sub>A segunda interface pública do projeto</Sub>
        <P>
          {
            '`include/ec_rgb_colors.h` é o cabeçalho de outra biblioteca, com duas funções de impressão colorida. Tanto o `main` quanto a própria biblioteca de contas são clientes dela: é `ec_imprimirCor` que `cb_criar` chama para avisar, em vermelho, que faltou memória.'
          }
        </P>
        <Listagem arquivo={cores.caminho} papel="interface pública" texto={cores.texto} faixas={[8, 11]} />
      </Topico>

      <Topico n={3}>
        <Listagem
          arquivo={biblioteca.caminho}
          papel="interface privada"
          texto={biblioteca.texto}
          de={1}
          ate={34}
          faixas={[7, 9, 19, 28]}
          marcas={{ 7: 1, 9: 2, 19: 3, 28: 4 }}
        />
        <Notas
          itens={[
            '`MAX_OPERACOES`: a capacidade do histórico. Cada conta guarda até 100 operações.',
            '`enum TipoOperacao`: nomes para os tipos de operação. A contagem começa em zero: `NAO_DEF` vale 0, `CRIACAO` 1, `DEPOSITO` 2, `SAQUE` 3, `TRANSFERENCIA` 4 e `EXCLUSAO` 5.',
            '`struct Operacao`: uma linha de extrato, com o que foi feito, quanto, o saldo antes, o saldo depois e a outra conta envolvida.',
            'A definição completa de `struct ContaBancaria`, o tipo que o `.h` só anunciou.',
          ]}
        />
        <P>
          {
            'Em C, “privado” quer dizer “não está no `.h`”. O `main` inclui apenas o cabeçalho, então o compilador nunca mostra a ele essas quatro definições. A linha 1 mostra o outro lado: o `.c` inclui o próprio cabeçalho, e assim o compilador confere se cada função implementada bate com o protótipo prometido.'
          }
        </P>
        <P>
          {
            'Funções auxiliares também podem ser privadas: basta declará-las `static` dentro do `.c`. No trecho enviado não aparece nenhuma.'
          }
        </P>
      </Topico>

      <Topico n={4}>
        <ContratoFuncoes />
        <P>
          {
            'Para `cb_excluir` e `cb_imprimir` o cabeçalho não traz comentário: a especificação delas é só o nome e a assinatura.'
          }
        </P>
        <Sub>O que o contrato deixa em aberto</Sub>
        <P>
          {
            'O `.h` avisa que depositar, sacar e transferir podem não conseguir, mas não diz em que situações. Quem revela isso é o `main`, que funciona como uma bateria de testes e provoca cada caso de propósito:'
          }
        </P>
        <CasosDeFalha />
        <P>
          {
            'Vale comentar na apresentação: essas condições de falha poderiam estar escritas nos comentários do `.h`. Hoje elas só aparecem no comportamento.'
          }
        </P>
      </Topico>

      <Topico n={5}>
        <Listagem
          arquivo={biblioteca.caminho}
          papel="implementação"
          texto={biblioteca.texto}
          de={36}
          ate={48}
          faixas={[39, 45, 46]}
          marcas={{ 38: 1, 39: 2, 40: 3, 45: 4, 47: 5 }}
          rodape={<p>O trecho enviado termina aqui. O corpo das outras cinco funções não veio.</p>}
        />
        <Notas
          itens={[
            'Variável local `conta`: um ponteiro, por enquanto sem endereço válido.',
            '`sizeof(struct ContaBancaria)` calcula quantos bytes uma conta inteira ocupa: 2012, por causa do histórico de 100 operações. `malloc` reserva esse bloco no heap e devolve o endereço. O `(struct ContaBancaria *)` na frente só converte o tipo do ponteiro; em C essa conversão é opcional.',
            'Sem memória, `malloc` devolve `NULL`. A função avisa em vermelho com `ec_imprimirCor` e repassa o `NULL` a quem chamou.',
            'Com o bloco garantido, o operador `->` grava nos campos: `numero` recebe o parâmetro `num` e `saldo` recebe `saldoInicial`.',
            'Devolve o endereço. A variável `conta` some quando a função termina, mas o bloco continua existindo: está no heap, e só `free` o desfaz.',
          ]}
        />
        <Nota rotulo="Ponto de atenção" tom="vermelho">
          <p>
            {rico(
              '`cb_criar` não grava nada em `pos_log` nem em `log`. Como `malloc` não zera a memória, esses campos nascem com o que estiver por lá. Se o seu arquivo completo não cuida disso em outro ponto, o conserto é uma linha antes do `return`: `conta->pos_log = 0;` — ou trocar `malloc` por `calloc`, que entrega o bloco zerado.',
            )}
          </p>
          <p>
            {rico(
              'O `enum` também tem o valor `CRIACAO`, indício de que a própria criação é uma operação a registrar no histórico.',
            )}
          </p>
        </Nota>
        <Sub>E as outras cinco funções?</Sub>
        <P>
          {
            'O corpo de `cb_excluir`, `cb_depositar`, `cb_sacar`, `cb_transferir` e `cb_imprimir` não estava no código enviado. Os tópicos 9 e 12 mostram o que cada uma precisa fazer para o `main` funcionar, sempre com a marca “esperado pelo .h”.'
          }
        </P>
      </Topico>

      <Topico n={6}>
        <P>
          {
            'O nome técnico é **tipo opaco** (ou tipo incompleto). Para o `main`, uma conta é uma caixa fechada: ele pode guardar o endereço dela e entregá-lo às funções, mais nada. Testei três jeitos de furar a caixa dentro de `apps/main.c`:'
          }
        </P>
        <CompilaNaoCompila />
        <Sub>O que se ganha com isso</Sub>
        <Itens
          itens={[
            '**Regras num lugar só.** Toda mudança de saldo passa por `cb_depositar`, `cb_sacar` ou `cb_transferir`, que podem recusar valor negativo ou saque maior que o saldo antes de mexer em qualquer coisa.',
            '**Liberdade para mudar por dentro.** Dá para aumentar `MAX_OPERACOES`, trocar o `float` do campo `saldo` por `double` ou reorganizar o histórico sem alterar uma linha do `main`: basta recompilar a biblioteca e ligar de novo.',
            '**Um único jeito de nascer e de terminar.** Como só a biblioteca sabe o tamanho do tipo, toda conta começa em `cb_criar` e acaba em `cb_excluir`.',
          ]}
        />
      </Topico>

      <Topico n={7}>
        <Nota rotulo="Sobre os comandos">
          {
            'O Makefile do projeto não veio junto. Os comandos usam as pastas que você mostrou (`include/`, `src/`, `apps/`) e supõem `obj/` e `bin/` para os arquivos gerados e `ec_rgb_colors.c` dentro de `src/`; troque pelos nomes do seu projeto. Testei todos com o seu código, menos `gdb` e `valgrind`, que não estavam instalados onde conferi.'
          }
        </Nota>

        <Cenario titulo="Compilar por partes" opcoes="-c -I" quando="O dia a dia">
          <Terminal
            linhas={[
              '$ gcc -c src/contaBancaria.c -I include -o obj/contaBancaria.o',
              '$ gcc -c src/ec_rgb_colors.c -I include -o obj/ec_rgb_colors.o',
              '$ gcc apps/main.c obj/contaBancaria.o obj/ec_rgb_colors.o -I include -o bin/main',
              '$ ./bin/main',
            ]}
          />
          <P>
            {
              '`-c` compila um `.c` sem ligar e gera o objeto `.o`; `-I include` diz onde procurar os `.h`. O `main.c` é compilado conhecendo só os cabeçalhos — é o encapsulamento do tópico 6 acontecendo — e os `.o` entram na etapa de ligação. Se só o `main.c` mudar, basta repetir a terceira linha.'
            }
          </P>
        </Cenario>

        <Cenario titulo="Ligar os avisos" opcoes="-Wall -Wextra -Wconversion" quando="Antes de rodar">
          <Terminal
            linhas={[
              '$ gcc -Wall -Wextra -c src/contaBancaria.c -I include -o obj/contaBancaria.o',
              '$ gcc -Wall -Wextra -Wconversion -c apps/main.c -I include -o obj/main.o',
              "apps/main.c:26:18: warning: conversion from 'double' to 'float' changes value from '1.4351889999999999e+4' to '1.43518896e+4f' [-Wfloat-conversion]",
              '# e mais dois avisos iguais a esse: apps/main.c:28:22 e apps/main.c:29:22',
            ]}
          />
          <P>
            {
              '`-Wall` e `-Wextra` fazem o compilador apontar código suspeito; o trecho enviado passa pelos dois sem nenhum aviso. Com `-Wconversion` aparecem três, nas linhas 26, 28 e 29 do `main`: os valores com centavos são escritos como `double` e mudam ao entrar no parâmetro `float` (tópico 13).'
            }
          </P>
        </Cenario>

        <Cenario titulo="Acompanhar linha a linha" opcoes="-g -O0" quando="Para ver o programa por dentro">
          <Terminal
            linhas={[
              '$ gcc -g -O0 apps/main.c src/contaBancaria.c src/ec_rgb_colors.c -I include -o bin/main_debug',
              '$ gdb ./bin/main_debug',
              '(gdb) break cb_criar',
              '(gdb) run',
              '(gdb) next',
              '(gdb) print *conta',
            ]}
          />
          <P>
            {
              '`-g` grava no executável a ligação entre cada instrução e a linha do `.c`; `-O0` desliga as otimizações, para a execução seguir a ordem do código. Parado dentro de `cb_criar`, avance com `next` até o `return` e peça `print *conta`: aparecem `numero` e `saldo` preenchidos, e dá para ver com que valor `pos_log` nasceu (tópico 5).'
            }
          </P>
        </Cenario>

        <Cenario
          titulo="Caçar erro de memória"
          opcoes="-fsanitize=address"
          quando="Para vazamento, free duplo e acesso a NULL"
        >
          <Terminal
            linhas={[
              '$ gcc -g -fsanitize=address apps/main.c src/contaBancaria.c src/ec_rgb_colors.c -I include -o bin/main_asan',
              '$ ./bin/main_asan',
              '# alternativa sem recompilar: valgrind --leak-check=full ./bin/main_debug',
            ]}
          />
          <P>
            {
              'O executável passa a vigiar cada `malloc` e cada `free`. O seu `main` já deixa três situações prontas para esse cenário:'
            }
          </P>
          <Armadilha
            titulo="Linha 38: a conta que ninguém exclui"
            texto="Está comentada: `//struct ContaBancaria *cNaoExcluir = cb_criar(1, 1);`. Tire o `//` e a conta 1 nunca é excluída. No fim da execução o relatório acusa o vazamento e aponta o `malloc` responsável:"
            saida={[
              'ERROR: LeakSanitizer: detected memory leaks',
              'Direct leak of 2012 byte(s) in 1 object(s) allocated from:',
              '    #1 in cb_criar src/contaBancaria.c:39',
              '    #2 in main apps/main.c:38',
              'SUMMARY: AddressSanitizer: 2012 byte(s) leaked in 1 allocation(s).',
            ]}
          />
          <Armadilha
            titulo="Linha 42: excluir a mesma conta de novo"
            texto="Se `cb_excluir` liberasse o bloco sem gravar `NULL` no ponteiro, a segunda chamada repetiria o `free`. Com uma versão de teste escrita desse jeito, o programa para na hora:"
            saida={[
              'ERROR: AddressSanitizer: attempting double-free',
              '    #1 in cb_excluir',
              '    #2 in main apps/main.c:42',
              'freed by thread T0 here:',
              '    #2 in main apps/main.c:39',
            ]}
          />
          <Armadilha
            titulo="Linhas 16, 33 e 37: chamadas com cNULL"
            texto="Se faltar o teste de `NULL`, a função tenta ler `conta->saldo` a partir do endereço zero. Sem o sanitizer o programa só cai, com falha de segmentação; com ele, o relatório mostra a linha:"
            saida={[
              'ERROR: AddressSanitizer: SEGV on unknown address 0x000000000004',
              '    #0 in cb_depositar',
              '    #1 in main apps/main.c:16',
            ]}
            depois="O endereço `0x4` não é acaso: é `NULL` mais os 4 bytes que separam `saldo` do começo da struct."
          />
        </Cenario>

        <Cenario
          titulo="Mensagens que ligam e desligam"
          opcoes="-DDEBUG"
          quando="Quando um printf ajuda mais que o depurador"
          marca={<Etiqueta>não está no código enviado</Etiqueta>}
        >
          <P>
            {
              'Outra forma clássica: cercar um `printf` de diagnóstico com `#ifdef DEBUG` e `#endif` dentro do `.c`. O trecho só entra no programa quando a compilação define a macro:'
            }
          </P>
          <Terminal linhas={['$ gcc -DDEBUG -c src/contaBancaria.c -I include -o obj/contaBancaria.o']} />
        </Cenario>

        <Cenario titulo="Versão de entrega" opcoes="-O2" quando="Depois que tudo funciona">
          <Terminal
            linhas={['$ gcc -O2 apps/main.c src/contaBancaria.c src/ec_rgb_colors.c -I include -o bin/main']}
          />
          <P>
            {
              'Sem `-g` e com otimização: o executável fica menor e mais rápido, mas ruim de depurar, porque o compilador reordena e elimina trechos. O resultado do `main` é o mesmo dos outros cenários.'
            }
          </P>
        </Cenario>
      </Topico>
    </>
  );
}
