/* ============================================================================
   PRODUTO DE EXEMPLO — copie este arquivo para cada produto novo.
   ----------------------------------------------------------------------------
   1. Copie:   config/produtos/exemplo.js  ->  config/produtos/meu-produto.js
   2. Troque tudo que está marcado com  PREENCHER
   3. Aponte config/produto.js para a sua cópia
   4. node build.js   (o build reclama de tudo que faltar ou estiver errado)

   REGRAS DA CASA
   - PREÇO SÓ AQUI. A página, o checkout e o servidor do Pix leem deste
     arquivo. Nunca escreva um preço direto no HTML.
   - Nada inventado: depoimento, avaliação, garantia, "loja oficial", número
     de vendas. Se não tem, deixe vazio — o bloco some.
   - Para ESCONDER um bloco opcional use null ou lista vazia: brinde, bump,
     pv.ugc.videos, atendimento.chatUrl, marca.whatsapp.
   - Os preços abaixo são de EXEMPLO. Troque pelos seus antes de publicar.

   IMAGENS: ficam em public/images/loja/ em .webp. Os nomes usados aqui
   (galeria-1, produto-1, ...) são os arquivos de exemplo que já vêm na pasta;
   substitua pelos seus com o MESMO nome ou troque o nome aqui.
   ============================================================================ */
module.exports = {

  layout: 'pryon',

  /* ---------------------------------------------------------------- 1. SEO */
  seo: {
    lang: 'pt-BR',
    dominio: 'https://PREENCHER.com.br',              // PREENCHER: domínio final, sem barra no fim
    titulo: 'Nome do Produto — Kit Completo | Sua Loja', // PREENCHER
    descricao: 'Descrição curta do produto para o Google (até ~155 caracteres). Frete grátis e Pix aprovado na hora.', // PREENCHER
    ogTipo: 'product',
    ogTitulo: 'Nome do Produto — Kit Completo',          // PREENCHER: título ao compartilhar o link
    ogDescricao: 'Frase curta que aparece ao compartilhar o link. Pague no Pix.', // PREENCHER
    ogImagem: 'public/images/loja/galeria-1.webp',
    ogImagemW: 900,
    ogImagemH: 900,
    favicon: 'public/images/brand/favicon.png',
    siteName: 'Sua Loja',                                // PREENCHER
    marcaProduto: 'Marca do Produto',                    // PREENCHER: marca do fabricante
    themeColor: '#8C2456',
    fontesUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
  },

  /* -------------------------------------------------------------- 2. MARCA */
  marca: {
    nome: 'Sua Loja',                                    // PREENCHER
    ponto: '',
    nomeLegal: 'Sua Loja',                               // PREENCHER: razão social ou nome fantasia
    sobre: 'Uma frase sobre a loja.',                    // PREENCHER
    email: '',                                           // PREENCHER (vazio = sem e-mail na página)
    telefone: '',                                        // PREENCHER ex.: (11) 90000-0000
    telefoneLink: '',                                    // PREENCHER ex.: +5511900000000
    whatsapp: '',                                        // PREENCHER só dígitos com 55 (vazio = sem WhatsApp)
    horario: 'Atendimento: seg a sex, 9h às 18h',
    copyright: '© 2026 Sua Loja. Todos os direitos reservados.' // PREENCHER
  },

  /* ------------------------------------------------------------- 3. CORES
     rs = cor principal (botões, preço). Rode `node tools/contraste.js`
     depois de mexer, para conferir a leitura. */
  cores: {
    pp:    '#FFFBFC',
    sf:    '#FFFFFF',
    sf2:   '#FDF3F7',
    ln:    '#F1E2E9',
    ln2:   '#E5CCD8',
    t1:    '#2A1220',
    t2:    '#4B3442',
    t3:    '#6B5463',
    rs:    '#8C2456',
    rsD:   '#6C1A42',
    rsW:   '#FBEEF4',
    rsLn:  '#F4D6E4',
    au:    '#9A6A0E',
    gr:    '#13703A'
  },
  tipografia: {
    display: "'Fraunces',Georgia,serif",
    texto: "'Plus Jakarta Sans',system-ui,sans-serif"
  },

  /* ----------------------------------------------------------- 4. TRACKING */
  tracking: {
    metaPixelId: null,                                   // PREENCHER: id do pixel (string) ou null
    storagePrefix: 'sualoja',                            // PREENCHER: curto, sem espaço, um por loja
    utmify: true,
    janelaAtribuicaoDias: 7
  },

  /* ----------------------------------------------------------- 5. CHECKOUT
     Korvex (painel app.korvexgateway.com): o link de checkout é por OFERTA
     (pay.korvexgateway.com/CODIGO). Crie as ofertas no painel e cole o código
     de cada uma em `code` lá embaixo. */
  checkout: {
    provedor: 'korvex',
    apiBase: 'https://api.korvexgateway.com/api/v1',
    produtoId: '',
    baseCheckout: 'https://pay.korvexgateway.com/',
    nomeNoExtrato: null,
    freteExpressoCentavos: 990,
    freteExpressoPrazo: '1 a 3 dias úteis',
    fretePadraoPrazo: '5 a 9 dias úteis',
    prefixoPedido: 'xx',                                 // PREENCHER: 2 letras da loja
    validadePix: '15 minutos',
    incluso: [                                           // PREENCHER: o que vem em 1 kit
      { qtd: 1, nome: 'Produto 1 · 30 ml' },
      { qtd: 1, nome: 'Produto 2 · 30 ml' },
      { qtd: 1, nome: 'Produto 3 · 30 ml' }
    ],
    trocarLabel: 'Trocar kit',
    garantiaCurta: '7 dias para desistir',
    enviaEmailPix: false,
    redirecionarSeFalhar: false
  },

  /* ------------------------------------------------------------ 6. OFERTAS
     Preços em CENTAVOS (4990 = R$ 49,90). `deCentavos` = preço riscado.
     `code` = código da oferta na Korvex. `brinde` (opcional) = item grátis
     daquela oferta; apague a linha para não ter brinde. */
  ofertas: [
    {
      id: 'kit1', code: '',                              // PREENCHER code
      centavos: 4990, deCentavos: 8990,                  // EXEMPLO
      nome: '1 Kit Nome do Produto',
      rotulo: '1 Kit', rotuloCurto: '1 Kit',
      desc: '1 de cada produto',
      sub: '1 de cada produto · 1 mês de uso',
      selo: 'Novidade',
      unidades: 1, dias: 30, destaque: null
    },
    {
      id: 'kit2', code: '',                              // PREENCHER code
      centavos: 7990, deCentavos: 17980,                 // EXEMPLO
      nome: '2 Kits Nome do Produto',
      rotulo: '2 Kits', rotuloCurto: '2 Kits',
      desc: '2 de cada produto',
      sub: '2 de cada produto · 2 meses de uso',
      selo: 'Recomendado',
      unidades: 2, dias: 60, destaque: 'Recomendado',
      brinde: 'Nome do brinde · 50 g'                    // PREENCHER ou apague
    },
    {
      id: 'kit3', code: '',                              // PREENCHER code
      centavos: 9990, deCentavos: 26970,                 // EXEMPLO
      nome: '3 Kits Nome do Produto',
      rotulo: '3 Kits', rotuloCurto: '3 Kits',
      desc: '3 de cada produto',
      sub: '3 de cada produto · 3 meses de uso',
      selo: 'Mais vantajoso',
      unidades: 3, dias: 90, destaque: null,
      brinde: 'Nome do brinde · 50 g'                    // PREENCHER ou apague
    }
  ],

  /* UPSELL NO CHECKOUT ("leve também por + R$ X"). O valor é somado NO
     SERVIDOR a partir daqui. `bump: null` desliga. `imagens` = nomes dos
     .webp em public/images/loja/. */
  bump: {
    id: 'extra',
    nome: 'Produto Extra',                               // PREENCHER
    chamada: 'Leve também o Produto Extra',
    itens: ['Item extra 1 · 50 g', 'Item extra 2 · 30 ml'],
    texto: 'Uma frase dizendo por que vale levar junto.',
    centavos: 3990,                                      // EXEMPLO
    deCentavos: 11800,                                   // EXEMPLO
    imagens: ['extra-1', 'extra-2']
  },

  ofertaPadrao: 'kit2',
  ofertaComparativo: 'kit3',

  /* Usado pela máquina (pré-carga da 1ª foto e a frase do "por dia"). */
  hero: {
    imagem: {
      src: 'public/images/loja/galeria-1.webp',
      src480: 'public/images/loja/galeria-1-480.webp',
      src760: 'public/images/loja/galeria-1.webp',
      src1160: 'public/images/loja/galeria-1.webp',
      alt: 'Foto principal do produto'                   // PREENCHER
    },
    perDiaPrefixo: 'Sai a',
    perDiaSufixo: 'por dia',
    brinde: null
  },

  /* =========================================================================
     CONTEÚDO DA PÁGINA (layout pryon, src/pryon/body.html)
     ========================================================================= */
  pv: {
    topbar: [
      { icone: 'truck', html: '<b>Frete grátis</b> para todo o Brasil' },
      { icone: 'zap', html: 'Pix aprovado <b>na hora</b>, aqui mesmo na página' },
      { icone: 'spark', html: '<b>Benefício</b> principal do produto' },     // PREENCHER
      { icone: 'shield', html: '<b>7 dias</b> para desistir, pelo Código do Consumidor' }
    ],
    navCta: 'Ver kits',

    /* ---- primeira dobra */
    galeria: [                                           // PREENCHER: galeria-N.webp, -480 e -mini
      { src: 'galeria-1', alt: 'Descreva a foto 1' },
      { src: 'galeria-2', alt: 'Descreva a foto 2' },
      { src: 'galeria-3', alt: 'Descreva a foto 3' }
    ],
    selo: 'Off hoje',
    vidros: ['Destaque 1', 'Destaque 2'],
    pilula: 'Linha / marca do produto',
    pilulaSub: 'Ativo 1 · Ativo 2 · Ativo 3',
    titulo: 'Nome do Produto',
    tituloLinha2: 'a promessa principal com <em>uma palavra</em> em destaque',
    sub: 'Uma frase explicando o que o produto faz, sem promessa que você não pode provar.',
    pixDica: 'À vista no Pix · aprovado na hora',
    escolhaRotulo: 'Escolha seu kit',
    riscadoNota: 'Oferta no Pix · frete grátis em todos os kits.',
    economiaAntes: 'Você economiza',
    economiaDepois: 'neste kit',
    cta: 'Quero meu kit',
    confianca: [
      { icone: 'lock', texto: 'Pagamento seguro' },
      { icone: 'truck', texto: 'Frete grátis' },
      { icone: 'zap', texto: 'Pix na hora' },
      { icone: 'shield', texto: '7 dias para desistir' }
    ],

    /* ---- vídeos de quem usa. SÓ vídeos com direito de uso. Lista vazia =
       a seção some. Para cada { n: N } coloque em public/media/ugc/:
       previa-N.mp4 (6 s, sem som), video-N.mp4 (com som) e capa-N.jpg. */
    ugc: {
      titulo: 'Quem usa',
      sub: 'toque para assistir com som',
      cta: 'Quero o meu kit',
      videos: []
    },

    /* ---- brinde (texto acima dos kits). Vazio = sem faixa de brinde. */
    brindeChamada: 'Levando 2 ou 3 kits, o brinde vai de graça',
    brindeCurto: '+ brinde grátis',
    brindeImagem: 'brinde',

    /* ---- por dentro do kit */
    dentro: {
      olho: 'Por dentro do kit',
      titulo: 'Três produtos, <em>um trabalho</em> para cada um',
      lead: 'Uma frase sobre como os produtos se completam.',
      itens: [
        { foto: 'produto-1', tom: 'cinza', camada: 'Função 1', nome: 'Produto 1', tamanho: '30 ml', texto: 'O que este produto faz.', alt: 'Produto 1, frasco de 30 ml' },
        { foto: 'produto-2', tom: 'azul', camada: 'Função 2', nome: 'Produto 2', tamanho: '30 ml', texto: 'O que este produto faz.', alt: 'Produto 2, frasco de 30 ml' },
        { foto: 'produto-3', tom: 'rosa', camada: 'Função 3', nome: 'Produto 3', tamanho: '30 ml', texto: 'O que este produto faz.', alt: 'Produto 3, frasco de 30 ml' }
      ],
      formulaRotulo: 'Ver a fórmula de cada um',
      formula: [
        { p: 'Produto 1', r: '<b>Ativo principal</b> — o que ele faz.' },
        { p: 'Produto 2', r: '<b>Ativo principal</b> — o que ele faz.' },
        { p: 'Produto 3', r: '<b>Ativo principal</b> — o que ele faz.' }
      ]
    },

    /* ---- como o kit age (palco interativo; funciona com 2 a 4 passos) */
    age: {
      olho: 'Como o kit age',
      titulo: 'O problema acontece em <em>várias frentes</em>',
      lead: 'Toque nos números para ver o que cada produto faz',
      passos: [
        { fantasma: 'Passo 1', olho: 'Frente 1', foto: 'produto-1', tituloA: 'Ajuda a', tituloEm: 'resultado 1', texto: 'Explique o que o produto 1 faz.', vidroE: { b: 'Benefício', t: 'detalhe curto' }, vidroD: { b: 'Benefício', t: 'detalhe curto' }, chips: ['Ativo', 'Quando usar'] },
        { fantasma: 'Passo 2', olho: 'Frente 2', foto: 'produto-2', tituloA: 'Ajuda a', tituloEm: 'resultado 2', texto: 'Explique o que o produto 2 faz.', vidroE: { b: 'Benefício', t: 'detalhe curto' }, vidroD: { b: 'Benefício', t: 'detalhe curto' }, chips: ['Ativo', 'Quando usar'] },
        { fantasma: 'Passo 3', olho: 'Frente 3', foto: 'produto-3', tituloA: 'Ajuda a', tituloEm: 'resultado 3', texto: 'Explique o que o produto 3 faz.', vidroE: { b: 'Benefício', t: 'detalhe curto' }, vidroD: { b: 'Benefício', t: 'detalhe curto' }, chips: ['Ativo', 'Quando usar'] },
        { fantasma: 'Juntos', olho: 'Os três juntos', foto: 'kit', tituloA: 'Tudo', tituloEm: 'ao mesmo tempo', texto: 'Explique por que o kit funciona melhor que um produto só.', vidroE: { b: 'Rotina', t: 'manhã e noite' }, vidroD: { b: 'Kit', t: 'completo' }, chips: ['Uso diário'] }
      ]
    },

    /* ---- vitrine em movimento (fotos com legenda) */
    vitrine: {
      olho: 'O resultado completo',
      titulo: 'O que o kit trabalha <em>ao mesmo tempo</em>',
      lead: 'Uma frase de apoio',
      itens: [
        { foto: 'vitrine-1', titulo: 'Benefício 1' },
        { foto: 'vitrine-2', titulo: 'Benefício 2' },
        { foto: 'vitrine-3', titulo: 'Benefício 3' },
        { foto: 'vitrine-4', titulo: 'Benefício 4' }
      ]
    },

    /* ---- como usar (imagem public/images/loja/rotina.webp) */
    rotina: {
      olho: 'Como usar',
      titulo: 'Manhã e noite, <em>simples</em>',
      lead: 'Uma frase de como usar.',
      imagemAlt: 'Descreva a foto da rotina',
      vidros: [
        { icone: 'sol', b: 'Manhã', t: 'Produto 1 + 2' },
        { icone: 'lua', b: 'Noite', t: 'Produto 3' },
        { icone: 'shield', b: 'Dica', t: 'texto curto' }
      ],
      passos: [
        { icone: 'sol', titulo: 'Manhã', texto: 'Como usar de manhã.' },
        { icone: 'lua', titulo: 'Noite', texto: 'Como usar à noite.' },
        { icone: 'spark', titulo: 'Primeiras semanas', texto: 'Cuidado especial no começo, se houver.' }
      ],
      nota: 'Resultados variam de pessoa para pessoa.'
    },

    /* ---- âncora de valor (3 argumentos) */
    valor: {
      olho: 'Seu kit completo sai por',
      sufixo: '/dia',
      sub: 'no kit que você escolher',
      argumentos: [
        { icone: 'spark', rotulo: 'pelos 3 kits', texto: 'Argumento de preço verdadeiro e verificável.' },
        { icone: 'truck', grande: 'Grátis', rotulo: 'o frete', texto: 'Para qualquer cidade do Brasil, em 5 a 9 dias úteis.' },
        { icone: 'shield', grande: '7 dias', rotulo: 'para desistir', texto: 'Pelo Código de Defesa do Consumidor, a partir do recebimento, com devolução integral.' }
      ]
    },

    /* ---- kits (imagem public/images/loja/kit.webp) */
    kits: {
      olho: 'Escolha seu kit',
      titulo: 'Quanto mais tempo de uso, <em>menos por dia</em>',
      lead: 'Cada kit traz todos os produtos, com frete grátis.',
      imagemAlt: 'Os produtos do kit lado a lado',
      economia: 'Economia de',
      cta: 'Comprar este kit'
    },

    faq: { titulo: 'Dúvidas frequentes', lead: 'A gente responde antes de você perguntar' },

    /* ---- compra segura: só o que a lei dá, nada inventado */
    seguro: {
      titulo: 'Mudou de ideia?',
      destaque: '7 dias para desistir',
      texto: 'Pelo Código de Defesa do Consumidor (art. 49), você tem <b>7 dias corridos a partir do recebimento</b> para desistir de uma compra feita pela internet, com <b>devolução integral do valor pago</b>.',
      cta: 'Escolher meu kit'
    },

    rodape: {
      sobre: 'Uma frase sobre a loja. Se revende marca de terceiros, diga que é loja independente.',
      selos: [{ icone: 'pix', t: 'Pix' }, { icone: 'lock', t: 'Site seguro' }, { icone: 'truck', t: 'Frete grátis' }]
    },

    barra: { cta: 'Comprar' }
  },

  /* Chat de atendimento: endereço do projeto de ENTREGA (template-entrega-pix),
     sem barra no fim. Vazio = sem chat. */
  atendimento: { chatUrl: '' },                          // PREENCHER ex.: 'https://entrega-sualoja.vercel.app'

  /* Avaliações: só reais. Lista vazia = sem nota no Google. */
  avaliacoes: { eyebrow: '', titulo: '', nota: '', resumo: '', selo: '', itens: [], ugc: null, ugcAlt: '' },

  /* A máquina exige este bloco; deixe assim. */
  comparativo: { colunas: ['Kit'], linhas: [] },

  /* ------------------------------------------------------------------ FAQ
     {{FRETE_EXPRESSO}} vira o valor do frete expresso. */
  faq: {
    eyebrow: 'Dúvidas',
    titulo: 'Antes de comprar',
    itens: [
      { p: 'Como funciona o pagamento no Pix?', r: 'Você escolhe o kit, preenche seus dados e o QR Code e o código copia-e-cola aparecem na hora, aqui mesmo na página. Assim que o banco confirma, o pedido entra automaticamente — não precisa mandar comprovante.' },
      { p: 'Como funciona o frete?', r: 'Frete grátis para qualquer cidade do Brasil, com entrega em 5 a 9 dias úteis após o despacho. Na tela de pagamento você pode somar o frete expresso por {{FRETE_EXPRESSO}}, com entrega em 1 a 3 dias úteis.' },
      { p: 'Posso desistir da compra?', r: 'Sim. Pelo Código de Defesa do Consumidor (art. 49), você tem 7 dias corridos a partir do recebimento para desistir de uma compra feita pela internet, com devolução integral do valor pago.' },
      { p: 'Pergunta sobre o produto?', r: 'PREENCHER: resposta verdadeira.' }
    ]
  },

  rodape: { selos: [], colunas: [] },

  /* Página de rastreio do projeto de entrega. */
  paginas: { rastreioUrl: '' },                          // PREENCHER ex.: 'https://entrega-sualoja.vercel.app/rastrear-pedido'

  /* Textos das páginas de termos/privacidade/rastreio. */
  legal: {
    produtoNome: 'Nome do Produto',                      // PREENCHER: como o produto é chamado nas políticas
    revendaMarca: '',                                    // PREENCHER: marca de terceiros que você revende, ou vazio
    disclaimer: 'Resultados variam de pessoa para pessoa. Este site não é afiliado ao Facebook, Instagram ou Meta.',
    voltarLabel: 'Voltar para a página do kit',
    paginaKitLabel: 'Página do kit'
  }
};
