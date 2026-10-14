// =============================================================================
// GET /api/ofertas — kits, preços, frete e pagamento, LIDOS DO CATÁLOGO.
//
// Existe para o chat de atendimento (projeto de entrega) responder
// "quanto custa?", "qual compensa?" e "demora quanto?" com o MESMO valor que a
// página mostra e que o Pix cobra. Preço tem fonte única (catalogo.js): o chat
// nunca guarda preço próprio, pergunta aqui.
//
// Só dado público (o mesmo que está na página). Sem cliente, sem pedido.
// =============================================================================
const CATALOGO = require('../catalogo.js');
const PRODUTO = require('../config/produto.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Use GET.' });
  }
  const ofertas = CATALOGO.ORDEM.map((id) => {
    const o = CATALOGO.OFERTAS[id];
    return {
      id,
      rotulo: o.rotulo,
      nome: o.nome,
      desc: o.desc,
      sub: o.sub,
      unidades: o.unidades,
      dias: o.dias,
      precoCentavos: o.centavos,
      deCentavos: o.deCentavos,
      preco: CATALOGO.emMoeda(o.centavos),
      de: CATALOGO.emMoeda(o.deCentavos),
      porDia: CATALOGO.emMoeda(Math.round(o.centavos / o.dias)),
      porKit: CATALOGO.emMoeda(Math.round(o.centavos / o.unidades)),
      economia: CATALOGO.emMoeda(o.deCentavos - o.centavos),
      desconto: Math.round((1 - o.centavos / o.deCentavos) * 100),
      padrao: id === CATALOGO.PADRAO,
      brinde: o.brinde || null
    };
  });
  const c = PRODUTO.checkout;
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({
    loja: PRODUTO.seo.siteName,
    url: PRODUTO.seo.dominio,
    ofertas,
    incluso: (c.incluso || []).map((i) => i.nome),
    bump: CATALOGO.BUMP ? { nome: CATALOGO.BUMP.nome, itens: CATALOGO.BUMP.itens, preco: CATALOGO.emMoeda(CATALOGO.BUMP.centavos), de: CATALOGO.emMoeda(CATALOGO.BUMP.deCentavos) } : null,
    frete: {
      padrao: 'Grátis',
      padraoPrazo: c.fretePadraoPrazo,
      expresso: CATALOGO.emMoeda(CATALOGO.FRETE_EXPRESSO_CENTAVOS),
      expressoPrazo: c.freteExpressoPrazo
    },
    pagamento: { metodos: ['pix'], validadePix: c.validadePix },
    contato: { whatsapp: PRODUTO.marca.whatsapp || null, telefone: PRODUTO.marca.telefone || null, email: PRODUTO.marca.email || null },
    rastreioUrl: (PRODUTO.paginas && PRODUTO.paginas.rastreioUrl) || null
  });
};
