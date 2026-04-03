/* ═══════════════════════════════════════════════
   HARAYAKI COFFEE CO. — main.js
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── JS READY (enables reveal CSS) ── */
  document.body.classList.add('js-ready');

  /* ── CUSTOM CURSOR ── */
  const cur = document.getElementById('cursor');
  const curRing = document.getElementById('cursor-ring');
  if (cur && curRing && window.matchMedia('(hover: hover)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    cur.style.left = '0'; cur.style.top = '0';
    curRing.style.left = '0'; curRing.style.top = '0';
    (function loop() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      cur.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      curRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ── NAV SCROLL ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── HAMBURGER ── */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    const toggle = (open) => {
      burger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle(!mobileMenu.classList.contains('open')));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ── SCROLL REVEAL ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // stagger children if parent has data-stagger
        if (e.target.dataset.stagger) {
          [...e.target.children].forEach((child, i) => {
            setTimeout(() => child.classList.add('visible'), i * 90);
          });
        }
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ── MENU TABS ── */
  document.querySelectorAll('.menu-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(tab.dataset.panel);
      if (panel) {
        panel.classList.add('active');
        // re-trigger reveals inside panel
        panel.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
      }
    });
  });

  /* ── HERO BACKGROUND CANVAS — animated wave field ── */
  (function initHeroCanvas() {
    const cv = document.getElementById('hero-canvas');
    if (!cv) return;
    const cx = cv.getContext('2d');
    let W, H, t = 0;
    const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
    resize();
    new ResizeObserver(resize).observe(cv);

    function drawFrame() {
      cx.clearRect(0, 0, W, H);

      // base gradient
      const bg = cx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#080f1e');
      bg.addColorStop(1, '#0d1526');
      cx.fillStyle = bg; cx.fillRect(0, 0, W, H);

      // radial glow — center-right
      const gl = cx.createRadialGradient(W * 0.68, H * 0.42, 0, W * 0.68, H * 0.42, W * 0.5);
      gl.addColorStop(0, 'rgba(26,39,68,0.75)');
      gl.addColorStop(1, 'rgba(8,15,30,0)');
      cx.fillStyle = gl; cx.fillRect(0, 0, W, H);

      // gold glow — lower left
      const gl2 = cx.createRadialGradient(W * 0.1, H * 0.85, 0, W * 0.1, H * 0.85, W * 0.35);
      gl2.addColorStop(0, 'rgba(200,169,110,0.04)');
      gl2.addColorStop(1, 'rgba(200,169,110,0)');
      cx.fillStyle = gl2; cx.fillRect(0, 0, W, H);

      // wave lines
      const waveCount = 20;
      for (let i = 0; i < waveCount; i++) {
        const yBase = (H / (waveCount + 2)) * (i + 1.2);
        const amp = 3 + i * 1.1;
        const freq = 0.007 + i * 0.00045;
        const phase = t * (0.004 + i * 0.00015) + i * 0.72;
        const alpha = 0.018 + (i / waveCount) * 0.062;
        cx.beginPath();
        cx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 3) {
          const y = yBase
            + Math.sin(x * freq + phase) * amp
            + Math.sin(x * freq * 1.7 + phase * 0.82) * (amp * 0.28);
          cx.lineTo(x, y);
        }
        cx.strokeStyle = `rgba(170,188,215,${alpha})`;
        cx.lineWidth = 0.75;
        cx.stroke();
      }

      // gold accent waves
      for (let i = 0; i < 3; i++) {
        const yBase = H * (0.22 + i * 0.26);
        const ph = t * 0.003 + i * 2.1;
        cx.beginPath(); cx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 4) {
          const y = yBase + Math.sin(x * 0.006 + ph) * 7 + Math.sin(x * 0.011 + ph * 1.15) * 3;
          cx.lineTo(x, y);
        }
        cx.strokeStyle = 'rgba(200,169,110,0.06)';
        cx.lineWidth = 1.1; cx.stroke();
      }

      // floating particles
      if (!initHeroCanvas._particles) {
        initHeroCanvas._particles = Array.from({ length: 40 }, () => ({
          x: Math.random(), y: Math.random(),
          vx: (Math.random() - 0.5) * 0.00015,
          vy: -Math.random() * 0.0002 - 0.00005,
          r: Math.random() * 1.5 + 0.5,
          a: Math.random() * 0.35
        }));
      }
      initHeroCanvas._particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -0.01) { p.y = 1.01; p.x = Math.random(); }
        cx.beginPath();
        cx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(200,169,110,${p.a})`;
        cx.fill();
      });

      t++;
      requestAnimationFrame(drawFrame);
    }
    drawFrame();
  })();

  /* ── STEAM CANVAS ── */
  (function initSteam() {
    const cv = document.getElementById('steam-canvas');
    if (!cv) return;
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height;

    class Particle {
      constructor(init) {
        this.reset(init);
      }
      reset(randomLife) {
        this.x = W / 2 + (Math.random() - 0.5) * 38;
        this.y = H;
        this.vx = (Math.random() - 0.5) * 0.42;
        this.vy = -(Math.random() * 0.8 + 0.48);
        this.life = randomLife ? Math.random() * 160 : 0;
        this.maxLife = Math.random() * 130 + 75;
        this.radius = Math.random() * 11 + 5;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = (Math.random() - 0.5) * 0.038;
      }
      update() {
        this.life++;
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * 0.32;
        this.y += this.vy;
        this.radius += 0.045;
      }
      draw() {
        const p = this.life / this.maxLife;
        const a = p < 0.25 ? (p / 0.25) * 0.13 : p > 0.72 ? ((1 - p) / 0.28) * 0.13 : 0.13;
        const g = cx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        g.addColorStop(0, `rgba(180,198,222,${a})`);
        g.addColorStop(1, `rgba(180,198,222,0)`);
        cx.beginPath();
        cx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        cx.fillStyle = g; cx.fill();
      }
    }

    const particles = Array.from({ length: 22 }, () => new Particle(true));
    (function loop() {
      cx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.update();
        if (p.life >= p.maxLife) p.reset(false);
        p.draw();
      });
      requestAnimationFrame(loop);
    })();
  })();

  /* ── EVENTS CANVAS — japanese wave scroll ── */
  (function initEventsCanvas() {
    const cv = document.getElementById('events-canvas');
    if (!cv) return;
    const cx = cv.getContext('2d');
    let W, H, t = 0;
    const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
    resize();
    new ResizeObserver(resize).observe(cv);

    (function loop() {
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = '#0b1422'; cx.fillRect(0, 0, W, H);

      // wave grid
      const count = 24;
      for (let i = 0; i < count; i++) {
        const yB = (H / (count + 2)) * (i + 1.5);
        const amp = 3.5 + i * 1.3;
        const freq = 0.012 + i * 0.0005;
        const ph = t * (0.005 + i * 0.00018) + i * 0.68;
        const al = 0.03 + (i / count) * 0.1;
        cx.beginPath(); cx.moveTo(0, yB);
        for (let x = 0; x <= W; x += 3) {
          const y = yB + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 1.9 + ph * 0.77) * (amp * 0.32);
          cx.lineTo(x, y);
        }
        cx.strokeStyle = `rgba(190,202,220,${al})`; cx.lineWidth = 0.85; cx.stroke();
      }
      // gold lines
      for (let i = 0; i < 4; i++) {
        const yB = H * (0.12 + i * 0.23);
        const ph = t * 0.003 + i * 1.7;
        cx.beginPath(); cx.moveTo(0, yB);
        for (let x = 0; x <= W; x += 3) {
          const y = yB + Math.sin(x * 0.009 + ph) * 8 + Math.sin(x * 0.017 + ph * 1.25) * 3.5;
          cx.lineTo(x, y);
        }
        cx.strokeStyle = 'rgba(200,169,110,0.09)'; cx.lineWidth = 1.3; cx.stroke();
      }
      t++;
      requestAnimationFrame(loop);
    })();
  })();

});
