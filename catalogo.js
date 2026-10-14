/* ============================================================================
   CATÁLOGO — A FONTE ÚNICA DE VERDADE DO PREÇO
   ----------------------------------------------------------------------------
   Este arquivo NÃO guarda preço. Ele DERIVA de `config/produto.js` e faz as
   travas de sanidade. Para mudar preço, edite as `ofertas` do config.

   POR QUE ESTE ARQUIVO EXISTE (incidente real, 31/08/2026)

   O preço vivia em DOIS lugares copiados à mão: o que a página EXIBIA e o que
   o gateway COBRAVA. Quando os preços foram arredondados, só um lado foi
   atualizado — e por um dia inteiro a página mostrou R$ 37,90 enquanto o Pix
   cobrava R$ 38,14. Em todas as ofertas.

   Divergência de preço na hora de pagar é das piores: a pessoa já decidiu
   comprar, vê outro valor no app do banco e desiste — e ainda fica com a
   impressão de que a loja tentou enganá-la.

   A partir daqui não dá mais para divergir:
     - `api/criar-pix.js` faz require deste arquivo. É o valor que vira o
       `amount` da cobrança no gateway.
     - `build.js` GERA daqui os blocos KORVEX e KITS do bundle, e ainda
       CONFERE os preços renderizados no HTML. Divergência quebra o build,
       não a venda.

   PREÇO EM CENTAVOS, SEMPRE INTEIRO. Float de dinheiro erra: 0.1+0.2 não dá
   0.3, e 38.14+12.90 vira 51.040000000000006. Converta para reais só na
   borda, ao falar com o gateway.

   AO MUDAR UM PREÇO: mude ANTES no painel do gateway (é ele quem cobra de
   verdade no checkout hospedado), depois no config, e rode `node build.js`.
   Como ler o preço real do gateway está em tools/README-precos.md.
   ============================================================================ */

const PRODUTO = require('./config/produto.js');

const PRODUTO_KORVEX = PRODUTO.checkout.produtoId;
const BASE_CHECKOUT = PRODUTO.checkout.baseCheckout;
const FRETE_EXPRESSO_CENTAVOS = PRODUTO.checkout.freteExpressoCentavos;

/* UPSELL do checkout (order bump). O preço vive aqui, como o das ofertas: o
   servidor soma ESTE valor quando o navegador diz bump:true. null = sem upsell. */
const BUMP = PRODUTO.bump ? {
  id: PRODUTO.bump.id,
  nome: PRODUTO.bump.nome,
  centavos: PRODUTO.bump.centavos,
  deCentavos: PRODUTO.bump.deCentavos,
  itens: PRODUTO.bump.itens || []
} : null;

/* O array de ofertas do config vira o mapa por id que o resto do código usa,
   e `ORDEM` preserva a ordem em que elas aparecem na página. O índice em ORDEM
   é o `data-i` dos botões de kit. */
const OFERTAS = {};
const ORDEM = [];
for (const o of PRODUTO.ofertas) {
  ORDEM.push(o.id);
  OFERTAS[o.id] = {
    code: o.code,
    centavos: o.centavos,
    deCentavos: o.deCentavos,
    nome: o.nome,
    unidades: o.unidades,
    rotulo: o.rotulo,
    rotuloCurto: o.rotuloCurto,
    desc: o.desc,
    sub: o.sub,
    dias: o.dias,
    destaque: o.destaque || null,
    /* Brinde POR oferta (ex.: protetor a partir de 2 kits). Vazio = sem brinde. */
    brinde: o.brinde || null
  };
}

const PADRAO = PRODUTO.ofertaPadrao;
const COMPARATIVO = PRODUTO.ofertaComparativo || ORDEM[ORDEM.length - 1];

/* --------------------------------------------------------------- conversão */

// Centavos -> reais, para a borda que fala com o gateway. Divisão simples, sem
// acumular float: 3790 -> 37.9
function emReais(centavos) {
  return Math.round(Number(centavos)) / 100;
}

// Centavos -> "R$ 37,90". Mesma formatação que a página usa.
function emMoeda(centavos) {
  return 'R$ ' + (Math.round(Number(centavos)) / 100).toFixed(2).replace('.', ',');
}

/* Trava de sanidade: roda ao carregar o arquivo, nos dois lados. Um preço
   quebrado aqui contamina tudo, então é melhor explodir no build ou no
   primeiro request do que gerar cobrança errada em silêncio. */
(function conferir() {
  if (!ORDEM.length) throw new Error('catalogo: config/produto.js nao definiu nenhuma oferta');
  let destaques = 0;
  for (const id of ORDEM) {
    const o = OFERTAS[id];
    if (!Number.isInteger(o.centavos) || o.centavos <= 0)
      throw new Error('catalogo: ' + id + '.centavos precisa ser inteiro positivo (centavos, nao reais)');
    if (!Number.isInteger(o.deCentavos) || o.deCentavos <= o.centavos)
      throw new Error('catalogo: ' + id + '.deCentavos precisa ser maior que o preco cobrado');
    if (!Number.isInteger(o.dias) || o.dias <= 0)
      throw new Error('catalogo: ' + id + '.dias precisa ser inteiro positivo (usado no "por dia")');
    if (!Number.isInteger(o.unidades) || o.unidades <= 0)
      throw new Error('catalogo: ' + id + '.unidades precisa ser inteiro positivo');
    /* `code` e `produtoId` servem SÓ ao checkout hospedado — o plano B que
       atende quando a API da Korvex falha. A cobrança normal é criada por API
       (`POST /gateway/pix/receive`) declarando o produto e o valor no próprio
       corpo, com o preço vindo daqui: ela não depende de nada cadastrado no
       painel. Por isso vazio é PERMITIDO (a página avisa e manda falar com a
       loja em vez de abrir link quebrado); o que não se aceita é código com
       formato inválido, que vira redirect para lugar nenhum. */
    if (o.code && !/^[A-Z0-9]{5,12}$/.test(o.code))
      throw new Error('catalogo: ' + id + '.code nao parece um codigo de oferta do gateway');
    if (o.destaque) destaques++;
  }
  if (destaques > 1)
    throw new Error('catalogo: mais de uma oferta com `destaque` — a tarja perde a funcao se todas tiverem');
  if (!Number.isInteger(FRETE_EXPRESSO_CENTAVOS) || FRETE_EXPRESSO_CENTAVOS < 0)
    throw new Error('catalogo: freteExpressoCentavos precisa ser inteiro em centavos');
  if (BUMP && (!Number.isInteger(BUMP.centavos) || BUMP.centavos <= 0 || !Number.isInteger(BUMP.deCentavos) || BUMP.deCentavos <= BUMP.centavos || !BUMP.id || !BUMP.nome))
    throw new Error('catalogo: bump precisa de id, nome, centavos > 0 e deCentavos maior que centavos');
  if (!OFERTAS[PADRAO]) throw new Error('catalogo: ofertaPadrao aponta para oferta inexistente: ' + PADRAO);
  if (!OFERTAS[COMPARATIVO]) throw new Error('catalogo: ofertaComparativo aponta para oferta inexistente: ' + COMPARATIVO);
  /* Vazio = sem checkout hospedado, e a página trata isso (ver acima). */
  if (!/^https:\/\//.test(BASE_CHECKOUT)) throw new Error('catalogo: checkout.baseCheckout precisa ser https');
})();

module.exports = {
  PRODUTO_KORVEX,
  BASE_CHECKOUT,
  OFERTAS,
  FRETE_EXPRESSO_CENTAVOS,
  BUMP,
  ORDEM,
  PADRAO,
  COMPARATIVO,
  emReais,
  emMoeda
};
