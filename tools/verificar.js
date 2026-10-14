/* ============================================================================
   VERIFICAR — confere, DE FORA, se a página no ar está mesmo vendável
     $ node tools/verificar.js
     $ ALVO=https://outro-dominio node tools/verificar.js

   Existe porque "configurei tudo" e "está funcionando" são duas coisas
   diferentes, e a distância entre as duas é sempre a mesma: env var que foi
   adicionada mas não subiu num deploy novo, alias que ficou apontando para o
   deploy anterior, config preenchido localmente e não publicado.

   Este script NÃO chama a API da Korvex. Ele pergunta para os nossos próprios
   endpoints, uma vez cada. Consulta repetida em API de terceiro é o que já fez
   o WAF do fornecedor bloquear a nossa origem e derrubar o checkout.
   ============================================================================ */
'use strict';

const PRODUTO = require('../config/produto.js');
const CATALOGO = require('../catalogo.js');

const ALVO = (process.env.ALVO || PRODUTO.seo.dominio).replace(/[/]+$/, '');

const PLACEHOLDERS = ['000000000000000', 'SEUPRODUTO000', 'EXEMPLO1', 'EXEMPLO2', 'EXEMPLO3',
  'contato@exemplo.com.br', '(00) 00000-0000'];

let falhou = false;
const linha = (ok, titulo, detalhe) => {
  if (!ok) falhou = true;
  console.log('  ' + (ok ? 'ok  ' : '*** ') + titulo.padEnd(42) + (detalhe || ''));
};

async function pegar(caminho, opcoes) {
  const r = await fetch(ALVO + caminho, Object.assign({ redirect: 'follow' }, opcoes));
  const texto = await r.text();
  let json = null;
  try { json = JSON.parse(texto); } catch (e) {}
  return { status: r.status, texto, json };
}

(async () => {
  console.log('\nVERIFICACAO —', ALVO, '\n');

  /* ---- 1. config: sobrou algum valor de exemplo? ---- */
  const sobrando = [];
  if (PLACEHOLDERS.includes(PRODUTO.tracking.metaPixelId)) sobrando.push('metaPixelId');
  if (PLACEHOLDERS.includes(PRODUTO.checkout.produtoId)) sobrando.push('produtoId');
  PRODUTO.ofertas.forEach((o) => { if (PLACEHOLDERS.includes(o.code)) sobrando.push('oferta ' + o.id); });
  if (PLACEHOLDERS.includes(PRODUTO.marca.email)) sobrando.push('email');
  if (PLACEHOLDERS.includes(PRODUTO.marca.telefone)) sobrando.push('telefone');
  linha(!sobrando.length, 'config sem valor de exemplo', sobrando.length ? 'falta: ' + sobrando.join(', ') : '');

  /* ---- 2. a página responde e é a build atual? ---- */
  const home = await pegar('/');
  linha(home.status === 200, 'página responde', 'HTTP ' + home.status);

  const precoCatalogo = CATALOGO.emMoeda(CATALOGO.OFERTAS[CATALOGO.PADRAO].centavos);
  const precoNoAr = (home.texto.match(/id="hero-price">([^<]+)</) || [])[1];
  linha(precoNoAr === precoCatalogo, 'preço no ar == catálogo',
    'no ar: ' + precoNoAr + ' | catálogo: ' + precoCatalogo);

  const pixelNoAr = (home.texto.match(/fbq\('init',\s*'(\d+)'/) || [])[1];
  linha(!!pixelNoAr && pixelNoAr === PRODUTO.tracking.metaPixelId, 'pixel no ar == config',
    'no ar: ' + (pixelNoAr || '—'));

  const codigosNoAr = (home.texto.match(/code:'([A-Z0-9]+)'/g) || []).join(' ');
  const codigosOk = PRODUTO.ofertas.every((o) => codigosNoAr.includes(o.code));
  linha(codigosOk, 'código da oferta no bundle', codigosNoAr || '—');

  /* ---- 3. as funções enxergam as chaves? ---- */
  const sonda = await pegar('/api/criar-pix');
  const ativo = !!(sonda.json && sonda.json.ativo);
  /* Painel novo (pay.korvexgateway.com/CODIGO) não tem id de produto no link:
     lá basta o código da oferta. */
  const cadastrado = !!(PRODUTO.ofertas[0] || {}).code &&
    (!!PRODUTO.checkout.produtoId || /korvexgateway/.test(PRODUTO.checkout.baseCheckout || ''));
  const redireciona = PRODUTO.checkout.redirecionarSeFalhar !== false && cadastrado;
  linha(ativo, 'checkout na própria página ativo',
    ativo ? 'chaves da Korvex presentes'
          : 'SEM CHAVES — ' + (redireciona ? 'cai no checkout hospedado' : 'A PÁGINA NÃO COBRA'));
  if (!redireciona) {
    console.log('  --   só dentro do popup                     ' +
      (cadastrado ? 'redirecionarSeFalhar: false — o link hospedado existe' : 'sem produto/oferta cadastrados'));
    console.log('                                              mas a página não manda ninguém para fora');
  }

  /* O webhook TEM que recusar quem chega sem o segredo. Se ele aceitar, qualquer
     um forja venda paga: é falha de segurança, não de configuração. */
  const semSegredo = await pegar('/api/korvex-webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ event: 'TRANSACTION_PAID', transaction: { id: 'teste-sem-segredo' } })
  });
  linha([401, 403].includes(semSegredo.status), 'webhook recusa sem segredo',
    'HTTP ' + semSegredo.status + (semSegredo.status === 200 ? '  <- ACEITOU. Confira KORVEX_WEBHOOK_SECRET' : ''));

  /* ---- 4. páginas de apoio e arquivos de busca ---- */
  for (const rota of ['/termos', '/privacidade', '/rastrear-pedido', '/robots.txt', '/sitemap.xml']) {
    const r = await pegar(rota);
    linha(r.status === 200, 'rota ' + rota, 'HTTP ' + r.status);
  }

  /* ---- 5. imagens do hero e do brinde ---- */
  for (const img of [PRODUTO.seo.ogImagem, PRODUTO.hero.imagem.src, PRODUTO.hero.brinde && PRODUTO.hero.brinde.imagem]) {
    if (!img) continue;
    const r = await fetch(ALVO + '/' + img, { method: 'HEAD' });
    linha(r.status === 200, 'imagem ' + img.replace('public/images/', ''), 'HTTP ' + r.status);
  }

  console.log('');
  if (falhou) {
    console.error('  ALGUMA COISA NAO ESTA DE PE. Veja as linhas marcadas com ***\n');
    process.exitCode = 1;
  } else {
    console.log('  tudo de pe — a pagina esta vendavel.\n');
  }
})();
