// ISFT N°244 · interacciones
(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header y menú ---------- */
  var header = document.getElementById('top');
  var toggle = header.querySelector('.top__toggle');
  var nav = document.getElementById('menu');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr').textContent = open ? 'Cerrar menú' : 'Abrir menú';
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Scroll: header, frases que se pintan ---------- */
  var fills = Array.prototype.slice.call(document.querySelectorAll('.fill'));
  var ticking = false;
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    var vh = window.innerHeight;
    fills.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (vh * 0.45);
      el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Entradas al aparecer ---------- */
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Hero: parallax de íconos y luz que sigue al cursor ---------- */
  var hero = document.querySelector('.hero');
  document.querySelectorAll('.q__par').forEach(function (el) {
    el.style.setProperty('--depth', el.getAttribute('data-depth'));
  });
  if (hero && !reduce && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--mx', (x * 2).toFixed(3));
      hero.style.setProperty('--my', (y * 2).toFixed(3));
      hero.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--mx', 0);
      hero.style.setProperty('--my', 0);
    });
  }

  /* ---------- Red de datos animada (canvas) ---------- */
  function Net(canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, nodes = [], mouse = { x: -9999, y: -9999 };
    var running = false, raf = 0;
    var colors = ['255,255,255', '255,255,255', '255,255,255', '76,192,138', '242,123,72'];
    var host = canvas.parentElement;

    function resize() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, Math.max(28, (w * h) / 16000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 1, c: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      if (!running) draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var max = 140, i, j, a, b, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (running) {
          // el cursor atrae suavemente los nodos cercanos
          dx = mouse.x - a.x; dy = mouse.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 200) { a.vx += dx / d * 0.012; a.vy += dy / d * 0.012; }
          a.vx *= 0.99; a.vy *= 0.99;
          var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
          if (sp < 0.12) { a.vx *= 1.05; a.vy *= 1.05; }
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y; d = dx * dx + dy * dy;
          if (d < max * max) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.16 * (1 - Math.sqrt(d) / max)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        dx = a.x - mouse.x; dy = a.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180) {
          ctx.strokeStyle = 'rgba(76,192,138,' + (0.5 * (1 - d / 180)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(' + a.c + ',.75)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    }

    host.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    host.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    window.addEventListener('resize', resize);
    resize();

    if (reduce) return;   // sin movimiento: queda la red estática
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !running) { running = true; draw(); }
        else if (!en[0].isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
      }).observe(canvas);
    } else { running = true; draw(); }
  }
  document.querySelectorAll('canvas[data-net]').forEach(function (c) { Net(c); });

  /* ---------- Año del footer ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
