// Lerock's v2: mini player com Spotify (carrega só no clique), modo revisão e grade da newsletter.
(function () {
  var SPOTIFY = 'https://open.spotify.com/embed/artist/4ismQ738W44jaS75QdoMyQ?utm_source=generator&theme=0';
  var player = document.querySelector('.player');
  var panel = document.getElementById('player-panel');
  var mainBtn = document.querySelector('.player__btn');

  function openPlayer() {
    if (!panel.firstChild) {
      var f = document.createElement('iframe');
      f.src = SPOTIFY;
      f.title = "Lerock's no Spotify";
      f.loading = 'lazy';
      f.allow = 'clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      panel.appendChild(f);
    }
    panel.hidden = false;
    player.dataset.open = 'true';
    document.body.classList.add('is-playing');
    mainBtn.setAttribute('aria-expanded', 'true');
  }
  function closePlayer() {
    panel.hidden = true;
    player.dataset.open = 'false';
    document.body.classList.remove('is-playing');
    mainBtn.setAttribute('aria-expanded', 'false');
  }

  document.querySelectorAll('.js-play').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b === mainBtn && player.dataset.open === 'true') { closePlayer(); return; }
      document.querySelectorAll('.tracklist button').forEach(function (x) { x.classList.remove('is-active'); });
      if (b.closest('.tracklist')) b.classList.add('is-active');
      var t = b.querySelector('.t');
      if (t) document.querySelector('.player__t').innerHTML = t.textContent + " <em>— Lerock's</em>";
      openPlayer();
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePlayer(); });

  // Voltar ao topo: sobe até o início, com ou sem animação conforme a preferência do aparelho
  document.querySelectorAll('a[href="#topo"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var reduceTop = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceTop ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
  });

  // Próximas datas. Para anunciar um show, adicione um item, por exemplo:
  // { data: '2026-12-12', local: 'Nome do clube', cidade: 'São Paulo, SP', link: 'https://ingressos...' }
  // Datas que já passaram somem sozinhas. Sem itens, aparece o aviso "Nenhuma data anunciada".
  var AGENDA = [];

  var MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var proximas = AGENDA
    .map(function (s) { var p = s.data.split('-'); s._d = new Date(+p[0], +p[1] - 1, +p[2]); return s; })
    .filter(function (s) { return s._d >= hoje; })
    .sort(function (a, b) { return a._d - b._d; });
  var lista = document.getElementById('agenda');
  var vazia = document.getElementById('agenda-vazia');
  function esc(t) { var d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; }
  if (proximas.length) {
    vazia.hidden = true;
    lista.innerHTML = proximas.map(function (s) {
      var link = s.link ? '<a class="textlink" href="' + esc(s.link) + '" target="_blank" rel="noopener">Ingressos <svg class="ico" aria-hidden="true"><use href="#i-arrow-r"/></svg></a>' : '<span class="label">Em breve</span>';
      return '<li><span class="dates__day"><small>' + MESES[s._d.getMonth()] + '</small><b>' + String(s._d.getDate()).padStart(2, '0') + '</b><small>' + s._d.getFullYear() + '</small></span>' +
        '<span class="dates__info"><span class="dates__place">' + esc(s.local) + '</span><span class="label">' + esc(s.cidade) + '</span></span>' + link + '</li>';
    }).join('');
  } else {
    lista.hidden = true;
  }

  // Grade de "Onde vai tocar": equalizador que anda no compasso (124 BPM, colcheias)
  var c = document.querySelector('.news__grid');
  if (c && c.getContext) {
    var ctx = c.getContext('2d');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var S = 26, G = 14, cols = 0, rows = 0, W = 0, H = 0, step = 0, levels = [], timer = null;
    var STEP_MS = Math.round(60000 / 124 / 2);
    function size() {
      var r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      W = r.width; H = r.height;
      c.width = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / S); rows = Math.ceil(H / S);
      while (levels.length < cols) levels.push(0);
    }
    function contentBottom() { var inner = document.querySelector(".news__inner"); var cr = c.getBoundingClientRect(), ir = inner.getBoundingClientRect(); return ir.bottom - cr.top + 24; }
    function target(col, st) {
      var maxH = Math.max(3, Math.floor((H - contentBottom()) / S) - 1);
      var beat = st / 2;
      var kick = (st % 4 === 0) ? 1 : (st % 4 === 2 ? 0.55 : 0.25);
      var wave = (Math.sin(col * 0.33 + beat * 0.8) + 1) / 2;
      var wave2 = (Math.sin(col * 0.11 - beat * 0.45) + 1) / 2;
      var bassSide = 1 - col / cols * 0.5;
      var v = (wave * 0.55 + wave2 * 0.45) * (0.45 + 0.55 * kick) * bassSide;
      return Math.max(0, Math.round(v * maxH + (Math.random() - 0.5) * 2));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var head = step % cols;
      for (var x = 0; x < cols; x++) {
        var lv = levels[x] || 0;
        for (var y = 0; y < rows; y++) {
          var fromBottom = rows - 1 - y;
          var col = '#1b1a19';
          if (fromBottom < lv) col = '#2a1615';
          if (fromBottom === lv && lv > 0) col = '#d93030';
          if (x === head && fromBottom > lv) col = '#201f1e';
          ctx.fillStyle = col;
          ctx.fillRect(x * S, y * S, G, G);
        }
      }
    }
    function tick() {
      step++;
      for (var x = 0; x < cols; x++) {
        var t = target(x, step);
        levels[x] = t > levels[x] ? t : Math.max(t, levels[x] - 1);
      }
      draw();
    }
    size();
    for (var x = 0; x < cols; x++) levels[x] = target(x, 0);
    draw();
    window.addEventListener('resize', function () { size(); draw(); });
    if (!reduce) {
      var vis = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !timer) timer = setInterval(tick, STEP_MS);
          if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
        });
      });
      vis.observe(c);
    }
  }
})();
