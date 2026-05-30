/* ==========================================================================
   EL QUEBRACHO — main.js
   Menú mobile · partículas de fuego · scroll reveal · WhatsApp centralizado
   ========================================================================== */

/* ----------  CONFIG CENTRAL  ---------- */
const QUEBRACHO = {
  whatsapp: '5491123713598',          // 11-2371-3598
  instagram: 'elquebrachitolobos',
  email: 'hola@elquebracho.com.ar',
};

/* Genera un link de WhatsApp con mensaje pre-cargado */
function waLink(mensaje) {
  const txt = encodeURIComponent(mensaje || 'Hola! Quería hacer una consulta sobre El Quebracho 🔥');
  return `https://wa.me/${QUEBRACHO.whatsapp}?text=${txt}`;
}

document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initMobileMenu();
  initScrollReveal();
  initFireCanvas();
  initNavScroll();
  setYear();
});

/* ----------  1. WHATSAPP CENTRALIZADO  ---------- */
function initWhatsAppLinks() {
  document.querySelectorAll('[data-wa]').forEach((el) => {
    const msg = el.getAttribute('data-wa');
    el.setAttribute('href', waLink(msg));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
  // Instagram
  document.querySelectorAll('[data-ig]').forEach((el) => {
    el.setAttribute('href', `https://instagram.com/${QUEBRACHO.instagram}`);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
}

/* ----------  2. MENÚ MOBILE (HAMBURGUESA)  ---------- */
function initMobileMenu() {
  const burger = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');
  const backdrop = document.querySelector('.nav-backdrop');
  if (!burger || !links) return;

  const toggle = (open) => {
    const willOpen = open ?? !links.classList.contains('open');
    links.classList.toggle('open', willOpen);
    burger.classList.toggle('open', willOpen);
    backdrop?.classList.toggle('show', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
    document.body.style.overflow = willOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', () => toggle());
  backdrop?.addEventListener('click', () => toggle(false));
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => toggle(false))
  );
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
  });
}

/* ----------  3. SCROLL REVEAL  ---------- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => io.observe(el));
}

/* ----------  4. NAVBAR SCROLL STATE  ---------- */
function initNavScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = () => {
    nav.style.boxShadow = window.scrollY > 20 ? '0 6px 24px rgba(0,0,0,.35)' : 'none';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ----------  5. PARTÍCULAS DE FUEGO (HERO)  ---------- */
function initFireCanvas() {
  const canvas = document.getElementById('fire-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let w, h, particles = [], raf;
  const COLORS = ['#F5C842', '#C65B1A', '#e8893a', '#f7d774'];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
  }

  function spawn() {
    return {
      x: Math.random() * w,
      y: h + Math.random() * 40,
      r: 1 + Math.random() * 3,
      vy: -(0.4 + Math.random() * 1.4),
      vx: (Math.random() - 0.5) * 0.5,
      life: 0,
      maxLife: 120 + Math.random() * 160,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    };
  }

  const COUNT = window.innerWidth < 768 ? 45 : 90;

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => {
      const p = spawn();
      p.y = Math.random() * h;
      p.life = Math.random() * p.maxLife;
      return p;
    });
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.002;            // aceleración hacia arriba
      const t = p.life / p.maxLife;
      const alpha = Math.max(0, (1 - t) * 0.7);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 - t * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      if (p.life >= p.maxLife || p.y < -10) Object.assign(p, spawn());
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(tick);
  }

  init();
  tick();
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(init, 200);
  });

  // Pausa cuando no es visible (perf)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else tick();
  });
}

/* ----------  6. AÑO DINÁMICO EN FOOTER  ---------- */
function setYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}
