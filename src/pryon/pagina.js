/* ============================================================================
   LAYOUT PRYON (v3) — comportamento visual.
   Roda DEPOIS do app.js, que continua dono de preço, tracking, checkout,
   topbar rotativa, âncora de valor (#scn-valor) e barra fixa. Aqui só:
   espelho do kit escolhido, botões de kit, galeria, palco de 4 passos,
   entrada ao rolar e a trava "barra só depois do botão principal".
   Passa pelo renderizador do build: não pode conter chave dupla de template.
   ============================================================================ */
(function(){
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- kit escolhido -> economia
     O app.js troca o kit em selectKit(). Envolvemos a função global: os
     cliques do app.js chamam `selectKit` pelo nome, então passam por aqui. */
  function espelhar(){
    if(typeof KITS === 'undefined' || !KITS[selIdx]) return;
    var k = KITS[selIdx];
    document.querySelectorAll('[data-sel-economia],[data-sum-eco]').forEach(function(e){ e.textContent = money(k.o - k.p); });
    document.querySelectorAll('[data-sum-de]').forEach(function(e){ e.textContent = money(k.o); });
    document.querySelectorAll('[data-sel-preco]').forEach(function(e){ e.textContent = money(k.p); });
  }
  if(typeof selectKit === 'function'){
    var original = selectKit;
    selectKit = function(i){ original(i); espelhar(); };
  }
  espelhar();

  /* Botões da seção de kits: escolhem AQUELE kit antes de o modal abrir.
     Captura no documento para rodar antes do abrir() do app.js. */
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-kit]');
    if(b && typeof selectKit === 'function') selectKit(+b.getAttribute('data-kit'));
  }, true);

  /* ---------- "Acompanhar meu pedido" na tela de pago: leva o número do
     pedido (o app.js escreve em #ck-pedido) para a página de rastreio, que
     então só pede o e-mail da compra. */
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('#ck-rastreio');
    if(!a) return;
    var num = (document.getElementById('ck-pedido') || {}).textContent || '';
    num = num.trim();
    a.href = a.getAttribute('data-base') + (num ? '?codigo=' + encodeURIComponent(num) : '');
  }, true);

  /* ---------- barra fixa só depois do botão principal (o app.js decide o
     resto: some quando qualquer botão de compra está na tela). */
  var ctaPrincipal = document.querySelector('.hero .buycta');
  if(ctaPrincipal){
    var marcarPassou = function(){
      document.documentElement.classList.toggle('passou', ctaPrincipal.getBoundingClientRect().bottom < 0);
    };
    addEventListener('scroll', marcarPassou, { passive: true });
    marcarPassou();
  }

  /* ---------- galeria */
  var gal = document.querySelector('[data-gal]');
  if(gal){
    var trilho = gal.querySelector('[data-gal-trilho]');
    var slides = [].slice.call(trilho.children);
    var pontos = [].slice.call(gal.querySelectorAll('.gal-dots i'));
    var thumbs = [].slice.call(document.querySelectorAll('[data-gal-ir]'));
    var atual = 0;
    var marcar = function(i){
      atual = i;
      pontos.forEach(function(p, j){ p.classList.toggle('on', j === i); });
      thumbs.forEach(function(t, j){ t.classList.toggle('on', j === i); t.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    };
    var ir = function(i){
      i = (i + slides.length) % slides.length;
      trilho.scrollTo({ left: slides[i].offsetLeft, behavior: RM ? 'auto' : 'smooth' });
      marcar(i);
    };
    var pend = null;
    trilho.addEventListener('scroll', function(){
      clearTimeout(pend);
      pend = setTimeout(function(){
        var i = Math.round(trilho.scrollLeft / Math.max(1, trilho.clientWidth));
        if(i !== atual) marcar(Math.min(slides.length - 1, Math.max(0, i)));
      }, 80);
    }, { passive: true });
    gal.querySelector('[data-gal-ant]').addEventListener('click', function(){ ir(atual - 1); });
    gal.querySelector('[data-gal-prox]').addEventListener('click', function(){ ir(atual + 1); });
    thumbs.forEach(function(t){ t.addEventListener('click', function(){ ir(+t.getAttribute('data-gal-ir')); }); });
    trilho.addEventListener('keydown', function(e){
      if(e.key === 'ArrowRight'){ ir(atual + 1); e.preventDefault(); }
      if(e.key === 'ArrowLeft'){ ir(atual - 1); e.preventDefault(); }
    });
  }

  /* ---------- palco "como o kit age": 4 passos, troca sozinho até a pessoa
     tocar num número (aí para de vez — quem escolheu quer ler). */
  var palco = document.querySelector('[data-palco]');
  if(palco){
    var dots = [].slice.call(palco.querySelectorAll('.ps-dot'));
    var fills = [].slice.call(palco.querySelectorAll('[data-fill]'));
    var n = dots.length, idx = 0, auto = null;
    var mostrar = function(i){
      idx = i;
      for(var j = 0; j < n; j++) palco.style.setProperty('--a' + j, j === i ? 1 : 0);
      fills.forEach(function(f){ f.style.setProperty('--f', +f.getAttribute('data-fill') <= i ? 1 : 0); });
      dots.forEach(function(d, j){ d.classList.toggle('on', j === i); d.setAttribute('aria-selected', String(j === i)); });
    };
    var parar = function(){ if(auto){ clearInterval(auto); auto = null; } };
    dots.forEach(function(d, j){
      d.addEventListener('click', function(){ parar(); mostrar(j); });
      d.addEventListener('keydown', function(e){
        var k = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? j + 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? j - 1 : null;
        if(k === null) return;
        e.preventDefault(); parar(); k = (k + n) % n; mostrar(k); dots[k].focus();
      });
    });
    mostrar(0);
    if(!RM) auto = setInterval(function(){ mostrar((idx + 1) % n); }, 4600);
  }

  /* ---------- Vídeos de quem usa (pv.ugc)
     Prévias de 6 s, sem som, só carregam e tocam quando a fileira aparece na
     tela (dados do 4G da cliente). O toque abre o vídeo completo COM som num
     player em tela cheia; "Quero o meu kit" fecha e abre o checkout. */
  var ugcRow = document.querySelector('.ugc-row');
  var modal = document.querySelector('[data-ugc-modal]');
  if(ugcRow && modal){
    var previas = [].slice.call(ugcRow.querySelectorAll('video[data-src]'));
    var ligarPrevias = function(){
      previas.forEach(function(v){
        if(!v.src){ v.src = v.getAttribute('data-src'); }
        if(!RM){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }
      });
    };
    if('IntersectionObserver' in window){
      var ioUgc = new IntersectionObserver(function(ents){
        ents.forEach(function(en){
          if(en.isIntersecting){ ligarPrevias(); }
          else previas.forEach(function(v){ try{ v.pause(); }catch(e){} });
        });
      }, { rootMargin: '100px 0px' });
      ioUgc.observe(ugcRow);
    } else ligarPrevias();

    var player = modal.querySelector('[data-ugc-video]');
    var fecharUgc = function(){
      try{ player.pause(); }catch(e){}
      player.removeAttribute('src'); player.load();
      modal.hidden = true;
      document.body.classList.remove('ugc-aberto');
    };
    ugcRow.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('[data-ugc]');
      if(!b) return;
      player.src = 'public/media/ugc/video-' + b.getAttribute('data-ugc') + '.mp4';
      modal.hidden = false;
      document.body.classList.add('ugc-aberto');
      player.muted = false;
      var p = player.play(); if(p && p.catch) p.catch(function(){});
    });
    modal.addEventListener('click', function(e){
      if(e.target === modal || (e.target.closest && e.target.closest('[data-ugc-fechar]'))) fecharUgc();
    });
    modal.querySelector('[data-ugc-comprar]').addEventListener('click', function(){
      fecharUgc();
      var cta = document.querySelector('.hero .buycta');
      if(cta) cta.click();
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !modal.hidden) fecharUgc(); });
  }

  /* ---------- perguntas: uma aberta por vez */
  var faq = [].slice.call(document.querySelectorAll('.faq-item'));
  faq.forEach(function(d){
    d.addEventListener('toggle', function(){ if(d.open) faq.forEach(function(o){ if(o !== d) o.open = false; }); });
  });

  /* ---------- entrada ao rolar (.rv), com escalonamento dentro do grupo */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  var mostrarTudo = function(){ rv.forEach(function(e){ e.classList.add('in'); }); };
  if(RM || !('IntersectionObserver' in window)){ mostrarTudo(); }
  else {
    rv.forEach(function(e){
      var irmaos = [].slice.call(e.parentNode.children).filter(function(x){ return x.classList.contains('rv'); });
      var pos = irmaos.indexOf(e);
      if(pos > 0) e.style.transitionDelay = Math.min(pos, 5) * 80 + 'ms';
    });
    var io = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(function(e){ io.observe(e); });
    /* Rede de segurança: nada fica invisível para sempre se o observer não
       disparar (aba em segundo plano, navegador que não pinta quadros). */
    setTimeout(function(){ rv.forEach(function(e){ if(e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); }); }, 2500);
  }
})();
