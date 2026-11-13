#include <stdio.h>
#include "contaBancaria.h"
#include "ec_rgb_colors.h"

int main()
{
    struct ContaBancaria *c1 = NULL;
    //ec_imprimirTodasAsCores(100);
    c1 = cb_criar(521, 100);
    cb_imprimir(c1);
    struct ContaBancaria *c2 = cb_criar(1023, 30000);
    struct ContaBancaria *cNULL = NULL;

    cb_depositar(c1, 100);
    cb_depositar(c2, 3000);
    cb_depositar(cNULL, 10);
    cb_depositar(c2, -30);
    cb_sacar(c2, 200);
    cb_sacar(c2, 50000);
    cb_transferir(c1, c2, 50);
    if (!cb_transferir(c2, c1, -100))
    {
        ec_imprimirCor("\nnão foi possível efetuar a transferência!\n\n", "R");
    }

    cb_sacar(c2, 14351.89);
    cb_depositar(c2, 100000);
    cb_depositar(c2, 33333.87);
    cb_depositar(c2, 88111.66);
    cb_sacar(c2, 200000);

    cb_transferir(c2, c1, 100);
    cb_transferir(cNULL, c1, 100);

    cb_imprimir(c1);
    cb_imprimir(c2);
    cb_imprimir(cNULL);
    //struct ContaBancaria *cNaoExcluir = cb_criar(1, 1);
    cb_excluir(&c1);
    cb_excluir(&c2);
    cb_excluir(&cNULL);
    cb_excluir(&c1);
