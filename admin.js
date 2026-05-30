/* ==========================================================================
   EL QUEBRACHITO — Panel de administración
   Backend: GitHub Contents API. El token vive solo en localStorage.
   ========================================================================== */

const LS_KEY = 'eq_admin_creds';
const CONTENT_PATH = 'content.json';
const IMG_DIR = 'img';

let creds = null;       // { owner, repo, branch, token }
let content = null;     // objeto content.json en memoria
let contentSha = null;  // sha del archivo content.json (para updates)

/* ----------  Helpers DOM  ---------- */
const $ = (id) => document.getElementById(id);
const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');

function toast(msg, isErr = false) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.toggle('err', isErr);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), isErr ? 5000 : 3000);
}

/* ----------  GitHub API  ---------- */
function ghHeaders() {
  return {
    'Authorization': `Bearer ${creds.token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

function apiUrl(path) {
  return `https://api.github.com/repos/${creds.owner}/${creds.repo}/contents/${path}`;
}

// Decode/encode UTF-8 a base64 (necesario para tildes y emojis)
function utf8ToB64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64ToUtf8(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))));
}

async function ghGet(path) {
  const res = await fetch(`${apiUrl(path)}?ref=${creds.branch}`, { headers: ghHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.json()).message || res.statusText}`);
  return res.json();
}

async function ghPut(path, contentB64, message, sha = null) {
  const body = { message, content: contentB64, branch: creds.branch };
  if (sha) body.sha = sha;
  const res = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub ${res.status}: ${err.message || res.statusText}`);
  }
  return res.json();
}

/* ----------  Auth flow  ---------- */
async function connect() {
  const owner = $('ghOwner').value.trim();
  const repo = $('ghRepo').value.trim();
  const branch = $('ghBranch').value.trim() || 'main';
  const token = $('ghToken').value.trim();

  if (!owner || !repo || !token) {
    toast('Completá usuario, repositorio y token.', true);
    return;
  }

  creds = { owner, repo, branch, token };
  $('btnLogin').innerHTML = '<span class="spinner"></span> Conectando...';
  $('btnLogin').disabled = true;

  try {
    // Verificar acceso al repo
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders() });
    if (!repoRes.ok) {
      throw new Error(repoRes.status === 404
        ? 'Repositorio no encontrado o el token no tiene acceso.'
        : `No se pudo acceder (${repoRes.status}). Revisá el token.`);
    }
    localStorage.setItem(LS_KEY, JSON.stringify(creds));
    await loadContent();
    enterPanel();
    toast('Conectado correctamente 🔥');
  } catch (e) {
    toast(e.message, true);
    creds = null;
  } finally {
    $('btnLogin').innerHTML = 'Conectar';
    $('btnLogin').disabled = false;
  }
}

function logout() {
  localStorage.removeItem(LS_KEY);
  creds = null; content = null; contentSha = null;
  hide($('panelView')); show($('loginView'));
  $('ghToken').value = '';
}

/* ----------  Cargar / renderizar contenido  ---------- */
async function loadContent() {
  const file = await ghGet(CONTENT_PATH);
  if (file) {
    contentSha = file.sha;
    content = JSON.parse(b64ToUtf8(file.content));
  } else {
    // No existe aún: estructura por defecto
    contentSha = null;
    content = {
      config: { whatsapp: '', instagram: '', promoBanner: '' },
      hero: { titulo: '', palabraDestacada: '', eyebrow: '', subtitulo: '', imagen: '' },
      valores: [],
      productos: [],
      envios: { zonas: [] }
    };
  }
}

function renderPanel() {
  $('repoLabel').textContent = `${creds.owner}/${creds.repo} · rama ${creds.branch}`;
  $('connStatus').textContent = '● Conectado';
  $('connStatus').style.color = 'var(--ok)';

  // Config
  $('cfgWa').value = content.config?.whatsapp || '';
  $('cfgIg').value = content.config?.instagram || '';
  $('cfgBanner').value = content.config?.promoBanner || '';

  // Hero
  $('heroTitulo').value = content.hero?.titulo || '';
  $('heroPalabra').value = content.hero?.palabraDestacada || '';
  $('heroEyebrow').value = content.hero?.eyebrow || '';
  $('heroSubtitulo').value = content.hero?.subtitulo || '';
  $('heroImagen').value = content.hero?.imagen || '';
  updatePreview('heroImagen', 'heroPreview');

  renderProducts();
}

function renderProducts() {
  const list = $('prodList');
  list.innerHTML = '';
  (content.productos || []).forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'prod-item';
    div.innerHTML = `
      <img src="${p.imagen || ''}" alt="" onerror="this.style.visibility='hidden'" />
      <div class="info">
        <strong>${p.nombre || '(sin nombre)'} ${p.destacado ? '<span class="badge">Destacado</span>' : ''}</strong>
        <span>${p.linea || ''} · $${p.precio || '—'} · transf. $${p.precioTransferencia || '—'}</span>
      </div>
      <div class="acts">
        <button class="btn ghost" data-edit="${i}">Editar</button>
        <button class="btn danger" data-del="${i}">Borrar</button>
      </div>`;
    list.appendChild(div);
  });
  list.querySelectorAll('[data-edit]').forEach(b =>
    b.onclick = () => openProdModal(+b.dataset.edit));
  list.querySelectorAll('[data-del]').forEach(b =>
    b.onclick = () => { if (confirm('¿Borrar este producto?')) { content.productos.splice(+b.dataset.del, 1); renderProducts(); } });
}

/* ----------  Modal producto  ---------- */
function openProdModal(index) {
  const isNew = index === -1;
  const p = isNew ? {} : content.productos[index];
  $('prodModalTitle').textContent = isNew ? 'Nuevo producto' : 'Editar producto';
  $('prodIndex').value = index;
  $('prodLinea').value = p.linea || '';
  $('prodId').value = p.id || '';
  $('prodNombre').value = p.nombre || '';
  $('prodDesc').value = p.descripcion || '';
  $('prodPrecio').value = p.precio || '';
  $('prodPrecioT').value = p.precioTransferencia || '';
  $('prodImagen').value = p.imagen || '';
  $('prodDestacado').checked = !!p.destacado;
  $('prodFile').value = '';
  updatePreview('prodImagen', 'prodPreview');
  show($('prodModal'));
}

function saveProdLocal() {
  const index = +$('prodIndex').value;
  const p = {
    linea: $('prodLinea').value.trim(),
    id: $('prodId').value.trim() || $('prodNombre').value.trim().toLowerCase().replace(/\s+/g, '-'),
    nombre: $('prodNombre').value.trim(),
    descripcion: $('prodDesc').value.trim(),
    precio: $('prodPrecio').value.trim(),
    precioTransferencia: $('prodPrecioT').value.trim(),
    imagen: $('prodImagen').value.trim(),
    destacado: $('prodDestacado').checked
  };
  if (!p.nombre) { toast('El producto necesita un nombre.', true); return; }
  if (index === -1) content.productos.push(p);
  else content.productos[index] = p;
  hide($('prodModal'));
  renderProducts();
  toast('Producto guardado (recordá publicar los cambios).');
}

/* ----------  Subida de imágenes  ---------- */
function updatePreview(inputId, previewId) {
  const url = $(inputId).value.trim();
  const img = $(previewId);
  if (url) { img.src = url; show(img); } else { hide(img); }
}

async function uploadImage(file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const path = `${IMG_DIR}/${safeName}`;

  const b64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  await ghPut(path, b64, `Subir imagen ${safeName}`);
  // URL pública vía raw GitHub (funciona en GitHub Pages)
  return `${path}`;
}

async function handleFileUpload(fileInput, targetInput, previewId) {
  const file = fileInput.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('La imagen supera 5MB.', true); return; }
  toast('Subiendo imagen...');
  try {
    const path = await uploadImage(file);
    $(targetInput).value = path;
    updatePreview(targetInput, previewId);
    toast('Imagen subida ✓');
  } catch (e) {
    toast('Error al subir: ' + e.message, true);
  }
}

/* ----------  Guardar todo  ---------- */
function collectFromForm() {
  content.config = content.config || {};
  content.config.whatsapp = $('cfgWa').value.trim();
  content.config.instagram = $('cfgIg').value.trim();
  content.config.promoBanner = $('cfgBanner').value.trim();

  content.hero = content.hero || {};
  content.hero.titulo = $('heroTitulo').value.trim();
  content.hero.palabraDestacada = $('heroPalabra').value.trim();
  content.hero.eyebrow = $('heroEyebrow').value.trim();
  content.hero.subtitulo = $('heroSubtitulo').value.trim();
  content.hero.imagen = $('heroImagen').value.trim();
}

async function saveAll() {
  collectFromForm();
  $('btnSave').innerHTML = '<span class="spinner"></span> Publicando...';
  $('btnSave').disabled = true;
  try {
    const json = JSON.stringify(content, null, 2);
    const res = await ghPut(CONTENT_PATH, utf8ToB64(json),
      'Actualizar contenido del sitio (desde panel admin)', contentSha);
    contentSha = res.content.sha;
    toast('¡Cambios publicados! El sitio se actualiza en 1-2 minutos. 🔥');
  } catch (e) {
    toast('Error al guardar: ' + e.message, true);
  } finally {
    $('btnSave').innerHTML = '💾 Guardar y publicar cambios';
    $('btnSave').disabled = false;
  }
}

/* ----------  Navegación de vistas  ---------- */
function enterPanel() {
  hide($('loginView'));
  show($('panelView'));
  renderPanel();
}

/* ----------  Init / listeners  ---------- */
function init() {
  $('btnLogin').onclick = connect;
  $('btnLogout').onclick = logout;
  $('btnReload').onclick = async () => {
    try { await loadContent(); renderPanel(); toast('Contenido recargado.'); }
    catch (e) { toast(e.message, true); }
  };
  $('btnSave').onclick = saveAll;
  $('btnAddProd').onclick = () => openProdModal(-1);
  $('prodCancel').onclick = () => hide($('prodModal'));
  $('prodSaveLocal').onclick = saveProdLocal;

  $('heroImagen').oninput = () => updatePreview('heroImagen', 'heroPreview');
  $('prodImagen').oninput = () => updatePreview('prodImagen', 'prodPreview');
  $('heroFile').onchange = () => handleFileUpload($('heroFile'), 'heroImagen', 'heroPreview');
  $('prodFile').onchange = () => handleFileUpload($('prodFile'), 'prodImagen', 'prodPreview');

  // Autologin si hay credenciales guardadas
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    try {
      creds = JSON.parse(saved);
      $('ghOwner').value = creds.owner;
      $('ghRepo').value = creds.repo;
      $('ghBranch').value = creds.branch;
      loadContent().then(() => { enterPanel(); }).catch(() => { logout(); });
    } catch { logout(); }
  }
}

document.addEventListener('DOMContentLoaded', init);
