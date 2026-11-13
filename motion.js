// Lerock's — movimento: entrada da abertura, revelações ao rolar, letreiros que reagem à rolagem e parallax leve.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // Barra de progresso no topo (fica estática se houver redução de movimento)
  var top = document.querySelector('.top');
  var bar = document.createElement('span');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  if (top) top.appendChild(bar);

  if (reduce || !('IntersectionObserver' in window)) return;
  root.classList.add('motion');

  // Abertura: ordem dos blocos e nome letra por letra
  document.querySelectorAll('.bento > .tile').forEach(function (t, i) { t.style.setProperty('--i', i); });
  var name = document.querySelector('.hero-name');
  if (name) {
    var txt = name.textContent;
    name.setAttribute('aria-label', txt);
    name.innerHTML = txt.split('').map(function (c, i) {
      return '<span class="ch" aria-hidden="true" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
    }).join('');
  }

  // Revelações ao rolar
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  // Títulos grandes divididos em linhas (pelas quebras <br>)
  document.querySelectorAll('.mega').forEach(function (h) {
    var parts = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = parts.map(function (p, i) {
      return '<span class="line"><span style="--d:' + (i * 110) + 'ms">' + p.trim() + '</span></span>';
    }).join('');
    io.observe(h);
  });

  // Grupos com escalonamento entre irmãos
  var groups = [
    '.about > .wrap > .label', '.about__foot > *',
    '.release__bar > *', '.tracklist li', '.release__foot > *',
    '.cards > *',
    '.live__bar > *', '.live__head .btn', '.live__lede', '.tickets > *',
    '.insta__text > :not(.mega)', '.phones',
    '.news__inner > div > :not(.mega)', '.dates',
    '.foot__brand > *'
  ];
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', Math.min(i, 8) * 80 + 'ms');
      io.observe(el);
    });
  });

  var strip = document.querySelector('.strip');
  if (strip) {
    strip.querySelectorAll('figure').forEach(function (f, i) { f.style.setProperty('--d', i * 110 + 'ms'); });
    io.observe(strip);
  }
  var pads = document.querySelector('.pads');
  if (pads) {
    pads.querySelectorAll('a').forEach(function (a, i) { a.style.setProperty('--i', i); });
    io.observe(pads);
  }

  // Letreiros: andam sozinhos, aceleram e invertem conforme a rolagem; a faixa vermelha inclina
  var tracks = Array.prototype.map.call(document.querySelectorAll('.marquee__track, .ticker__track'), function (el) {
    return { el: el, x: 0, dir: 1, base: el.classList.contains('ticker__track') ? 0.4 : 1, half: 0 };
  });
  var marquee = document.querySelector('.marquee');
  var heroImg = document.querySelector('.tile--hero img');
  var phones = Array.prototype.slice.call(document.querySelectorAll('.phone'));
  var phoneFactor = [-0.07, 0.05, -0.11];

  function measure() { tracks.forEach(function (t) { t.half = t.el.scrollWidth / 2; }); }
  measure();
  window.addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  var lastY = window.scrollY, vel = 0;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function frame() {
    var y = window.scrollY;
    vel += ((y - lastY) - vel) * 0.18;
    lastY = y;

    tracks.forEach(function (t) {
      if (vel > 0.6) t.dir = 1; else if (vel < -0.6) t.dir = -1;
      t.x -= t.dir * (t.base + Math.min(Math.abs(vel) * 0.3, 14));
      if (t.half) { if (-t.x >= t.half) t.x += t.half; if (t.x > 0) t.x -= t.half; }
      t.el.style.transform = 'translate3d(' + t.x.toFixed(2) + 'px,0,0)';
    });
    if (marquee) marquee.style.transform = 'skewX(' + clamp(-vel * 0.18, -7, 7).toFixed(2) + 'deg)';

    var vh = window.innerHeight;
    if (heroImg && y < vh * 1.2) heroImg.style.translate = '0 ' + (y * 0.14).toFixed(1) + 'px';
    phones.forEach(function (p, i) {
      var r = p.getBoundingClientRect();
      if (r.bottom > -200 && r.top < vh + 200) {
        var off = (r.top + r.height / 2 - vh / 2) * (phoneFactor[i] || 0);
        p.style.translate = '0 ' + off.toFixed(1) + 'px';
      }
    });

    var max = document.documentElement.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0).toFixed(4) + ')';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
