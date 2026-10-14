/* ============================================================================
   PRODUTO ATIVO — o único arquivo que você troca para mudar de produto.
   Aponte para o arquivo do produto que esta cópia do template vai vender.
   Todo o resto (build.js, catalogo.js, api/, src/) lê daqui.

   Produto novo:
     1. copie config/produtos/exemplo.js para config/produtos/meu-produto.js
     2. preencha (procure por PREENCHER)
     3. troque a linha abaixo para './produtos/meu-produto.js'
     4. node build.js
   ============================================================================ */

module.exports = require('./produtos/exemplo.js');
