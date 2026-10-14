/* ============================================================================
   TESTAR-CHECKOUT — exercita api/criar-pix.js inteiro, sem tocar na Korvex
     $ npm install && node tools/testar-checkout.js

   Por que existe: o único jeito de saber se o servidor do checkout está certo
   era fazer uma venda real. Aqui a API da Korvex é substituída por um dublê
   que devolve a mesma forma de resposta, e o teste confere o que sai DAQUI
   para LÁ — que é onde moram os erros caros:

     - o valor cobrado (tem que vir do catalogo.js, nunca do navegador);
     - o `callbackUrl` (webhook apontando para o NOSSO domínio, não o da LP de
       referência — foi assim que uma cópia confirmou pagamento no projeto
       errado);
     - o `metadata`, que é o que a expedição lê: endereço, frete e brinde;
     - o QR gerado aqui quando a Korvex não manda imagem — é ele que mantém o
       pagamento DENTRO do popup, sem link para fora.

   Não substitui a compra de R$ 1,00 de verdade (docs/KORVEX.md §6): só prova
   que, quando as chaves chegarem, o que vai para a Korvex está correto.
   ============================================================================ */
'use strict';

process.env.KORVEX_PUBLIC_KEY = process.env.KORVEX_PUBLIC_KEY || 'pk_teste';
process.env.KORVEX_SECRET_KEY = process.env.KORVEX_SECRET_KEY || 'sk_teste';
process.env.KORVEX_WEBHOOK_SECRET = process.env.KORVEX_WEBHOOK_SECRET || 'segredo_teste';

const PRODUTO = require('../config/produto.js');
const CATALOGO = require('../catalogo.js');

let falhou = false;
const ok = (cond, titulo, detalhe) => {
  if (!cond) falhou = true;
  console.log('  ' + (cond ? 'ok  ' : '*** ') + titulo.padEnd(46) + (detalhe === undefined ? '' : detalhe));
};

/* ---- dublê da Korvex: guarda o que recebeu e responde como a de verdade ---- */
let enviado = null;
const fetchReal = globalThis.fetch;
globalThis.fetch = async (url, opcoes) => {
  const u = String(url);
  if (u.includes('korvex')) {
    enviado = { url: u, headers: (opcoes || {}).headers, corpo: JSON.parse((opcoes || {}).body || '{}') };
    /* BR CODE DINÂMICO, que é o que a Korvex devolve hoje: campo 01 = 12 e
       campo 26 com a URL do PSP; SEM campo 54. Era exatamente este formato que
       o guard antigo recusava — 502 em toda compra. O dublê tem que falar o
       formato de verdade, senão o teste aprova um checkout que não vende. */
    const url26 = 'psp.exemplo/cob/v2/abc123';
    const c26 = '0014BR.GOV.BCB.PIX' + '25' + String(url26.length).padStart(2, '0') + url26;
    const brcode = '000201' + '010212' +
      '26' + String(c26.length).padStart(2, '0') + c26 +
      '52040000' + '5303986' + '5802BR' + '5913' + String(PRODUTO.marca.nomeLegal || 'LOJA').toUpperCase().replace(/[^A-Z ]/g,'').slice(0,13).padEnd(13,' ') + '6009SAO PAULO' + '62070503***' + '6304ABCD';
    const corpo = JSON.stringify({
      transactionId: 'trx_duble_001',
      status: 'PENDING',
      order: { url: 'https://checkout.korvex.com.br/pedido/trx_duble_001' },
      /* A Korvex manda o copia-e-cola e, na prática, `image: null` — é esse
         caso que obriga o QR gerado por nós, que mantém tudo dentro do popup. */
      pix: { code: brcode, image: null }
    });
    return { ok: true, status: 201, json: async () => JSON.parse(corpo), text: async () => corpo };
  }
  /* O PSP consultado pelo guard do Pix dinâmico. Responde o mesmo JSON que o
     app do banco leria: valor travado e o nome do recebedor. */
  if (u.includes('psp.exemplo')) {
    /* O PSP trava o valor que a Korvex recebeu no `amount` — o dublê devolve o
       da última cobrança (antes devolvia sempre o do kit padrão, e o teste do
       upsell batia na trava de divergência, que estava certa). */
    const total = enviado && Number.isFinite(enviado.corpo.amount) ? enviado.corpo.amount : CATALOGO.emReais(CATALOGO.OFERTAS[CATALOGO.PADRAO].centavos);
    const corpo = JSON.stringify({
      valor: { original: String(total.toFixed(2)), modalidadeAlteracao: 0 },
      recebedor: { nome: 'RECEBEDOR DE TESTE LTDA' }
    });
    return { ok: true, status: 200, json: async () => JSON.parse(corpo), text: async () => corpo };
  }
  return fetchReal(url, opcoes);
};

/* ---- resposta HTTP de mentirinha ---- */
function resposta() {
  const r = { codigo: 0, corpo: null, cabecalhos: {} };
  r.setHeader = (k, v) => { r.cabecalhos[k] = v; };
  r.status = (c) => { r.codigo = c; return r; };
  r.json = (o) => { r.corpo = o; return r; };
  r.end = () => r;
  return r;
}

(async () => {
  console.log('\nTESTE DO CHECKOUT —', PRODUTO.seo.siteName, '\n');

  const handler = require('../api/criar-pix.js');
  const oferta = CATALOGO.OFERTAS[CATALOGO.PADRAO];

  const req = {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'teste', 'x-forwarded-for': '187.1.1.1' },
    query: {},
    body: {
      offerId: CATALOGO.PADRAO,
      frete: 'gratis',
      cliente: { nome: 'Joao da Silva Teste', email: 'teste@exemplo.com', telefone: '47999999999', cpf: '11144477735' },
      endereco: { cep: '89010-000', rua: 'Rua XV de Novembro', numero: '100', bairro: 'Centro', cidade: 'Blumenau', uf: 'SC' },
      tracking: { fbc: 'fb.1.123.abc', fbp: 'fb.1.456.def', utm_source: 'facebook', utm_campaign: 'teste' }
    }
  };

  const res = resposta();
  await handler(req, res);

  ok(res.codigo === 201, 'handler respondeu 201', 'HTTP ' + res.codigo +
    (res.corpo && res.corpo.motivo ? ' — ' + res.corpo.motivo : ''));
  if (!enviado) {
    ok(false, 'chamou a Korvex', 'NAO CHAMOU — o resto do teste nao vale');
    process.exitCode = 1;
    return;
  }

  const c = enviado.corpo;

  /* ---- o dinheiro ---- */
  /* A API da Korvex recebe REAIS; internamente tudo é centavo inteiro. A
     conversão acontece só nesta fronteira, e é ela que o teste confere. */
  ok(c.amount === CATALOGO.emReais(oferta.centavos), 'valor enviado = catálogo',
    'enviado: ' + c.amount + ' | catálogo: ' + CATALOGO.emReais(oferta.centavos));
  ok(!c.shippingFee, 'frete grátis não cobra frete', String(c.shippingFee || 0));

  /* Preço vindo do navegador é a falha clássica: com ele, qualquer um compra
     por R$ 1,00 mexendo no console. */
  const reqForjado = JSON.parse(JSON.stringify(req));
  reqForjado.body.amount = 100;
  reqForjado.body.total = 100;
  reqForjado.body.preco = 100;
  enviado = null;
  await handler(reqForjado, resposta());
  ok(enviado && enviado.corpo.amount === CATALOGO.emReais(oferta.centavos), 'ignora preço mandado pelo navegador',
    enviado ? 'cobrou ' + enviado.corpo.amount : '');

  /* ---- o webhook ---- */
  const dominio = PRODUTO.seo.dominio.replace(/[/]+$/, '');
  ok(String(c.callbackUrl).startsWith(dominio + '/api/korvex-webhook'),
    'callbackUrl aponta para este domínio', c.callbackUrl.split('?')[0]);
  ok(String(c.callbackUrl).includes('k=' + encodeURIComponent(process.env.KORVEX_WEBHOOK_SECRET)),
    'callbackUrl leva o segredo do webhook');

  /* ---- o que a expedição lê ---- */
  const m = c.metadata || {};
  ok(m.provider === 'LP ' + PRODUTO.seo.siteName, 'metadata.provider é desta loja', m.provider);
  ok(String(m.orderId || '').startsWith(PRODUTO.checkout.prefixoPedido + '-'),
    'número do pedido com o prefixo certo', m.orderId);
  ok(/Blumenau\/SC/.test(m.entrega_endereco || ''), 'endereço completo no metadata');
  ok(String(m.frete).includes(PRODUTO.checkout.fretePadraoPrazo), 'frete com o prazo do config', m.frete);
  /* O metadata leva o nome do brinde SEM html — ele é lido por quem separa o
     pedido, não renderizado. A comparação tem que ser contra o texto limpo. */
  const limpo = (v) => String(v || '').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&shy;/g, '')
    .replace(/[ \t\n\r]+/g, ' ').trim();
  // Brinde POR oferta (ofertas[].brinde); o global hero.brinde é só reserva.
  const brindeEsperado = oferta.brinde ? limpo(oferta.brinde) : (PRODUTO.hero.brinde ? limpo(PRODUTO.hero.brinde.nome) : undefined);
  ok(m.brinde === brindeEsperado, 'brinde do metadata == brinde do kit escolhido', String(m.brinde));
  ok(m.fbc === 'fb.1.123.abc' && m.utm_campaign === 'teste', 'fbc/fbp e UTM repassados');
  ok(!m.bump && c.products.length === 1, 'sem upsell marcado: 1 produto e nada de bump no metadata');

  /* ---- brinde só a partir de 2 kits ---- */
  const kitSemBrinde = CATALOGO.ORDEM.find((id) => !CATALOGO.OFERTAS[id].brinde);
  if (kitSemBrinde) {
    const r1 = JSON.parse(JSON.stringify(req)); r1.body.offerId = kitSemBrinde;
    enviado = null; await handler(r1, resposta());
    ok(enviado && !enviado.corpo.metadata.brinde, 'kit sem brinde (' + kitSemBrinde + ') não manda brinde', enviado ? String(enviado.corpo.metadata.brinde) : '');
  }

  /* ---- upsell (order bump) ---- */
  if (CATALOGO.BUMP) {
    const rb = JSON.parse(JSON.stringify(req)); rb.body.bump = true;
    const resB = resposta();
    enviado = null; await handler(rb, resB);
    const esperadoB = CATALOGO.emReais(oferta.centavos + CATALOGO.BUMP.centavos);
    ok(enviado && enviado.corpo.amount === esperadoB, 'upsell marcado: valor = kit + upsell do catálogo', enviado ? 'enviado ' + enviado.corpo.amount + ' | esperado ' + esperadoB : '');
    ok(enviado && enviado.corpo.products.length === 2 && enviado.corpo.products[1].price === CATALOGO.emReais(CATALOGO.BUMP.centavos), 'upsell entra como 2º produto da cobrança');
    ok(enviado && (enviado.corpo.metadata.bump || '').includes(CATALOGO.BUMP.nome), 'upsell no metadata (a expedição vê)', enviado ? enviado.corpo.metadata.bump : '');
    ok(resB.corpo && resB.corpo.total === esperadoB, 'total devolvido ao popup inclui o upsell', 'HTTP ' + resB.codigo + ' ' + JSON.stringify(resB.corpo).slice(0, 200));
    // navegador forjando: "bump":"sim", preço próprio do upsell → ignorados
    const rf = JSON.parse(JSON.stringify(req)); rf.body.bump = 'true'; rf.body.bumpPreco = 1;
    enviado = null; await handler(rf, resposta());
    ok(enviado && enviado.corpo.amount === CATALOGO.emReais(oferta.centavos), 'bump que não é true de verdade é ignorado (sem cobrança extra)');
  }

  /* ---- o que volta para o popup ---- */
  const res2 = resposta();
  enviado = null;
  await handler(req, res2);
  const corpo = res2.corpo || {};
  ok(!!(corpo.pix && corpo.pix.code), 'devolve o copia-e-cola');
  ok(!!(corpo.pix && /^data:image\/svg\+xml;base64,/.test(corpo.pix.image || '')),
    'QR gerado aqui (fica dentro do popup)',
    corpo.pix && corpo.pix.image ? corpo.pix.image.slice(0, 32) + '…' : 'SEM IMAGEM — cairia no link externo');
  ok(corpo.total === CATALOGO.emReais(oferta.centavos), 'total devolvido == catálogo', String(corpo.total));
  ok(corpo.pix && corpo.pix.dinamico === true, 'reconheceu o Pix dinâmico (guard novo)');
  ok(!!(corpo.pix && corpo.pix.recebedor), 'nome do recebedor lido no PSP',
    (corpo.pix && corpo.pix.recebedor) || 'SEM NOME — o aviso do banco fica genérico');

  console.log('');
  if (falhou) {
    console.error('  TESTE REPROVOU. Nada disso aparece em produção até ser corrigido.\n');
    process.exitCode = 1;
  } else {
    console.log('  servidor do checkout ok — falta só a chave real da Korvex.\n');
  }
})();
