/* ==========================================================================
   EL QUEBRACHITO — Content loader
   Lee content.json y actualiza el sitio con lo cargado desde el panel.
   Si el JSON no existe o falla, el contenido estático del HTML queda como está.
   ========================================================================== */
(function () {
  const WA_DEFAULT = '5491123713598';
  let resolvedWa = WA_DEFAULT;

  fetch('content.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(applyContent)
    .catch(() => { /* fallback: contenido estático del HTML */ });

  function applyContent(data) {
    if (!data) return;
    applyConfig(data.config);
    applyHero(data.hero);
    applyProducts(data.productos);
  }

  /* ----------  Config global  ---------- */
  function applyConfig(cfg) {
    if (!cfg) return;

    // Banner promocional
    if (cfg.promoBanner) {
      const banner = document.querySelector('.promo-banner');
      if (banner) banner.innerHTML = cfg.promoBanner;
    }

    // Links de WhatsApp (data-wa)
    const wa = (cfg.whatsapp || WA_DEFAULT).replace(/\D/g, '');
    resolvedWa = wa;
    document.querySelectorAll('[data-wa]').forEach(el => {
      const msg = encodeURIComponent(el.getAttribute('data-wa'));
      el.setAttribute('href', `https://wa.me/${wa}?text=${msg}`);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });

    // Links de Instagram (data-ig)
    if (cfg.instagram) {
      document.querySelectorAll('[data-ig]').forEach(el => {
        el.setAttribute('href', `https://instagram.com/${cfg.instagram}`);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
        if (el.textContent.includes('@')) el.textContent = '@' + cfg.instagram;
      });
    }
  }

  /* ----------  Hero  ---------- */
  function applyHero(hero) {
    if (!hero) return;
    const h1 = document.querySelector('.hero h1');
    if (h1 && hero.titulo) {
      const palabra = hero.palabraDestacada;
      if (palabra && hero.titulo.includes(palabra)) {
        h1.innerHTML = hero.titulo.replace(
          palabra, `<span class="hero-highlight">${palabra}</span>`);
      } else {
        h1.textContent = hero.titulo;
      }
    }
    const sub = document.querySelector('.hero .hero-subtitle');
    if (sub && hero.subtitulo) sub.textContent = hero.subtitulo;

    const eyebrow = document.querySelector('.hero .eyebrow');
    if (eyebrow && hero.eyebrow) eyebrow.textContent = hero.eyebrow;

    if (hero.imagen) {
      const heroEl = document.querySelector('.hero');
      if (heroEl) {
        // Aplicar imagen vía variable inline para el ::before
        const style = document.createElement('style');
        style.textContent = `.hero::before { background-image:
          linear-gradient(135deg, rgba(11,7,5,.7), rgba(210,105,30,.4)),
          url('${hero.imagen}') !important; }`;
        document.head.appendChild(style);
      }
    }
  }

  /* ----------  Productos  ---------- */
  function applyProducts(productos) {
    if (!productos || !productos.length) return;

    // Galería en el index (.gallery-grid)
    const gallery = document.querySelector('.gallery-grid');
    if (gallery) {
      gallery.innerHTML = productos.map(p => `
        <div class="gallery-item">
          <img src="${p.imagen || ''}" alt="${esc(p.nombre)}" onerror="this.style.visibility='hidden'" />
          <div class="gallery-overlay">
            <h4>${esc((p.linea || '').toUpperCase())}</h4>
            <p>${esc(p.nombre)}</p>
          </div>
        </div>`).join('');
    }

    // Grilla de productos en productos.html (#productos-dinamicos)
    const grid = document.getElementById('productos-dinamicos');
    if (grid) {
      const seccion = document.getElementById('catalogo-dinamico');
      if (seccion) seccion.style.display = '';
      grid.innerHTML = productos.map(p => `
        <article class="product-card${p.destacado ? ' featured' : ''}">
          <div class="product-card-img">
            <img src="${p.imagen || ''}" alt="${esc(p.nombre)}" onerror="this.style.visibility='hidden'" />
            ${p.destacado ? '<span class="product-badge">Destacado</span>' : ''}
          </div>
          <div class="product-card-body">
            <span class="product-linea">${esc(p.linea || '')}</span>
            <h3>${esc(p.nombre)}</h3>
            <p>${esc(p.descripcion || '')}</p>
            <div class="product-precio">
              ${p.precioTransferencia
                ? `<span class="precio-transf">$${esc(p.precioTransferencia)}</span>
                   <span class="precio-lista">$${esc(p.precio)}</span>
                   <span class="precio-nota">por transferencia</span>`
                : `<span class="precio-transf">$${esc(p.precio)}</span>`}
            </div>
            <a class="btn btn-fire" data-wa="Hola! Quería pedir: ${esc(p.nombre)} 🔥">Pedir por WhatsApp</a>
          </div>
        </article>`).join('');

      // Re-aplicar links de WhatsApp a los botones nuevos
      const wa = resolvedWa;
      grid.querySelectorAll('[data-wa]').forEach(el => {
        const msg = encodeURIComponent(el.getAttribute('data-wa'));
        el.setAttribute('href', `https://wa.me/${wa}?text=${msg}`);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      });
    }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
