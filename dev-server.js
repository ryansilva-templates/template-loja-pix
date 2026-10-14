/* Servidor local para conferir layout e o fluxo do checkout sem tocar na Korvex.
   node dev-server.js  →  http://localhost:4321

   As rotas de API abaixo são DUBLÊS. Elas imitam o contrato de api/criar-pix.js
   e api/status-pedido.js para dar para percorrer os 4 passos do checkout sem
   gerar cobrança de verdade. Em produção quem responde são as funções da Vercel.

   Aceita ?cenario= na query para testar o que costuma dar errado:
     (nada)      Pix gerado, e o pagamento "cai" 20s depois
     validacao   devolve 400 com erro em campo, como a API faria
     semchave    devolve 503 "sem credenciais" → a página cai no redirect
     forade      devolve 502 → idem
*/
const CATALOGO = require('./catalogo.js');
/* O dublê usava 'hb-teste-9931' e 'HIDRABENE LTDA' dentro do código Pix falso:
   testar o checkout e ver o nome de outra loja no BR Code confunde na hora de
   conferir o passo que mais importa. Sai do config, como o resto. */
const PRODUTO = require('./config/produto.js');
const PFX = (PRODUTO.checkout.prefixoPedido || 'pryon').toLowerCase();
/* Mesmo QR do servidor de produção, para o dublê não mentir sobre o que a
   página recebe. Se `qrcode` não estiver instalado, o dublê segue sem imagem —
   é um ambiente de teste, não pode derrubar por dependência. */
async function qrDataUri(texto) {
  try {
    const QRCode = require('qrcode');
    const svg = await QRCode.toString(String(texto), { type: 'svg', errorCorrectionLevel: 'M', margin: 1, width: 360 });
    return 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
  } catch (e) {
    return '';
  }
}
const NOME_BR = String(PRODUTO.marca.nomeLegal || 'LOJA').toUpperCase().replace(/[^A-Z ]/g, '').slice(0, 13).padEnd(13, ' ');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.webp':'image/webp', '.mp4':'video/mp4',
  '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.json':'application/json'
};

// Guarda quando cada cobrança falsa foi criada, para o status virar sozinho.
const criadas = new Map();
const PAGA_APOS_MS = 20000;

function json(res, codigo, corpo) {
  res.writeHead(codigo, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(corpo));
}

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost:4321');
  let caminho = decodeURIComponent(u.pathname);

  if (caminho === '/api/criar-pix') {
    const cenario = u.searchParams.get('cenario');
    // Sonda de capacidade: a página pergunta antes de decidir se mostra o
    // formulário ou o botão de redirect. ?cenario=semchave simula "sem chaves".
    if (req.method === 'GET') return json(res, 200, { ativo: cenario !== 'semchave' });
    let bruto = '';
    req.on('data', (c) => { bruto += c; });
    req.on('end', () => {
      if (cenario === 'semchave') return json(res, 503, { ok: false, motivo: 'sem credenciais' });
      if (cenario === 'forade') return json(res, 502, { ok: false, motivo: 'korvex recusou' });
      if (cenario === 'validacao') {
        return json(res, 400, { ok: false, erros: { cpf: 'CPF inválido. Confira os números.' } });
      }
      let corpo = {};
      try { corpo = JSON.parse(bruto || '{}'); } catch (e) {}
      const trx = 'trx_teste_' + Date.now().toString(36);
      criadas.set(trx, Date.now());
      console.log('[dublê] cobrança criada', trx, '| oferta', corpo.offerId, '| frete', corpo.frete);
      console.log('[dublê] endereço que iria em metadata:', JSON.stringify(corpo.endereco));
      /* Campo 54 com o tamanho CALCULADO: cravado em '04', so valia para preco
         de 2 digitos — R$ 219,90 saia como TLV quebrado. */
      const valor = (CATALOGO.OFERTAS[corpo.offerId].centavos / 100).toFixed(2);
      const codigo = '00020126580014BR.GOV.BCB.PIX0136teste-0000-0000-0000-0000000001520400005303986' +
        '54' + String(valor.length).padStart(2, '0') + valor +
        '5802BR5913' + NOME_BR + '6009SAO PAULO62070503***6304ABCD';
      /* O dublê tem que devolver o QUE A PRODUÇÃO DEVOLVE, senão o teste local
         aprova um caminho que não existe no ar. Em produção o QR é gerado no
         servidor (api/criar-pix.js) e vem como data URI — é ele que mantém o
         pagamento dentro do popup. E o nome do recebedor vem do payload do PSP,
         não do campo 59, porque o Pix da Korvex é dinâmico. */
      qrDataUri(codigo).then((imagem) => {
        json(res, 201, {
          ok: true,
          orderId: PFX + '-teste-9931',
          transactionId: trx,
          // do catalogo, para o dublê nunca mentir sobre o valor
          total: CATALOGO.emReais(CATALOGO.OFERTAS[corpo.offerId].centavos + (corpo.frete === 'expresso' ? CATALOGO.FRETE_EXPRESSO_CENTAVOS : 0)),
          frete: corpo.frete === 'expresso' ? CATALOGO.emReais(CATALOGO.FRETE_EXPRESSO_CENTAVOS) : 0,
          pix: {
            code: codigo,
            image: imagem,
            dinamico: true,
            recebedor: 'PROCESSADORA DE TESTE LTDA'
          }
        });
      });
    });
    return;
  }

  if (caminho === '/api/status-pedido') {
    const id = u.searchParams.get('id') || '';
    const quando = criadas.get(id);
    const pago = quando ? (Date.now() - quando) > PAGA_APOS_MS : false;
    console.log('[dublê] status', id, '→', pago ? 'COMPLETED' : 'PENDING');
    return json(res, 200, { ok: true, status: pago ? 'COMPLETED' : 'PENDING', pago, final: pago });
  }

  if (caminho === '/api/capi' || caminho === '/api/korvex-webhook') {
    req.on('data', () => {});
    req.on('end', () => json(res, 200, { ok: true, dublê: true }));
    return;
  }

  // cleanUrls: a Vercel serve /termos a partir de termos.html. Sem isso o teste
  // local dá 404 num link que funciona em produção.
  if (caminho === '/') caminho = '/index.html';
  let arquivo = path.join(ROOT, caminho);
  if (!fs.existsSync(arquivo) && fs.existsSync(arquivo + '.html')) arquivo += '.html';

  if (!path.normalize(arquivo).startsWith(path.normalize(ROOT))) { res.writeHead(403); return res.end(); }
  fs.readFile(arquivo, (e, d) => {
    if (e) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('404 ' + caminho); }
    res.writeHead(200, { 'content-type': MIME[path.extname(arquivo).toLowerCase()] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(4321, () => console.log('http://localhost:4321'));
