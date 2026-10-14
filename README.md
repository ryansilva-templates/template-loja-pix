# Template Loja Pix

Página de venda de produto físico com **checkout Pix dentro da página** (Korvex),
pixel da Meta + CAPI, UTM (UTMify), upsell no checkout e brinde por kit.

Funciona junto com o **template-entrega-pix**, que cuida do pós-venda: e-mails,
rastreio, recuperação de Pix e chat de atendimento.

## Como usar num produto novo

1. Faça uma cópia deste repositório: no GitHub, botão **Use this template**, ou
   baixe e crie um repositório novo.
2. Copie `config/produtos/exemplo.js` para `config/produtos/meu-produto.js`.
3. Preencha tudo que estiver marcado com **PREENCHER**.
4. Em `config/produto.js`, troque `exemplo.js` por `meu-produto.js`.
5. Troque as imagens de `public/images/loja/` pelas do produto, com os mesmos
   nomes. Se mudar os nomes, mude também no config.
6. Rode o build:

   ```
   npm ci
   node build.js
   node tools/testar-checkout.js
   ```

   O build reclama de tudo que estiver faltando ou errado. Os avisos dizem o
   que ainda falta decidir.
7. Na Vercel: crie o projeto apontando para o repositório.

## Na Korvex

- Crie uma **oferta para cada kit** e cole o código de cada uma no campo
  `code` da oferta, no config.
- Crie uma credencial de API.
- São **dois webhooks** de venda paga:
  - o desta página (`/api/korvex-webhook?k=SEU_SEGREDO`), que manda a
    Purchase para a Meta (CAPI) e a venda para a UTMify;
  - o do projeto de **entrega**, que dispara os e-mails e o rastreio.

## Variáveis de ambiente (painel da Vercel)

Você cola as chaves direto no painel da Vercel. **Nunca** coloque chave em
arquivo do repositório.

| Variável | O que é |
|---|---|
| `KORVEX_PUBLIC_KEY` / `KORVEX_SECRET_KEY` | Credencial de API da Korvex |
| `KORVEX_WEBHOOK_SECRET` | Segredo que você inventa para o webhook (`api/korvex-webhook.js`) |
| `META_PIXEL_ID` / `META_CAPI_TOKEN` | Pixel e token da API de Conversões (opcional) |
| `META_TEST_EVENT_CODE` | Só para testar eventos no Gerenciador (opcional) |
| `UTMIFY_API_TOKEN` | Envio das vendas para a UTMify (opcional) |
| `KORVEX_PIX_DESLIGADO` | `1` desliga o Pix na página (emergência) |

## Onde fica cada coisa

| Arquivo | Para que serve |
|---|---|
| `config/produtos/*.js` | Todo o conteúdo e os **preços**. Preço só existe aqui. |
| `catalogo.js` | Lê os preços do config e valida. O servidor do Pix cobra daqui. |
| `src/pryon/` | O visual: corpo da página, CSS e scripts. |
| `src/checkout.html`, `src/app.js` | O checkout em popup e a parte de pixel e UTM. |
| `src/pg-*.html` | As páginas de termos, privacidade e rastreio. |
| `api/` | Funções da Vercel: criar Pix, status, webhook, CAPI e ofertas para o chat. |
| `tools/` | Testes e conferências. Rode `verificar.js` depois de publicar. |

## Regras da casa

- **Nada inventado:** nem depoimento, nem avaliação, nem garantia, nem número
  de vendas. Se não tiver, deixe vazio que o bloco some da página. A única
  garantia que a página promete é a de 7 dias, que é lei (art. 49 do CDC).
- **Vídeos de clientes** (`pv.ugc.videos`): use só vídeos que você tem direito
  de usar.
- **Preço:** mudou o preço, mude **só** no config e rode o build de novo.
- **Opcionais:** brinde, upsell (`bump`), chat (`atendimento.chatUrl`) e vídeos
  saem da página quando ficam vazios ou `null`.
