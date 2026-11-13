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
    mainBtn.setAttribute('aria-expanded', 'true');
  }
  function closePlayer() {
    panel.hidden = true;
    player.dataset.open = 'false';
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
      var link = s.link ? '<a class="textlink" href="' + esc(s.link) + '" target="_blank" rel="noopener">Ingressos →</a>' : '<span class="label">Em breve</span>';
      return '<li><span class="dates__day"><small>' + MESES[s._d.getMonth()] + '</small><b>' + String(s._d.getDate()).padStart(2, '0') + '</b><small>' + s._d.getFullYear() + '</small></span>' +
        '<span class="dates__info"><span class="dates__place">' + esc(s.local) + '</span><span class="label">' + esc(s.cidade) + '</span></span>' + link + '</li>';
    }).join('');
  } else {
    lista.hidden = true;
  }

  // Grade de quadradinhos da newsletter
  var c = document.querySelector('.news__grid');
  if (c && c.getContext) {
    var ctx = c.getContext('2d');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cells = [];
    function draw() {
      var r = c.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      c.width = r.width * dpr; c.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var s = 26, g = 14, cols = Math.ceil(r.width / s), rows = Math.ceil(r.height / s);
      if (cells.length !== cols * rows) {
        cells = [];
        for (var i = 0; i < cols * rows; i++) cells.push(Math.random());
      }
      ctx.clearRect(0, 0, r.width, r.height);
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var v = cells[y * cols + x];
        var bottom = y / rows;
        ctx.fillStyle = v > 0.985 - bottom * 0.08 ? '#d93030' : '#1b1a19';
        ctx.fillRect(x * s, y * s, g, g);
      }
    }
    draw();
    window.addEventListener('resize', draw);
    if (!reduce) setInterval(function () {
      for (var k = 0; k < 12; k++) cells[Math.floor(Math.random() * cells.length)] = Math.random();
      draw();
    }, 900);
  }
})();
