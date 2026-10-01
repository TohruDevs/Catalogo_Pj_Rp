const getToken = () => localStorage.getItem('token');
const getUsuario = () => { try { return JSON.parse(localStorage.getItem('usuario')); } catch { return null; } };
const guardarSesion = (token, usuario) => { localStorage.setItem('token', token); localStorage.setItem('usuario', JSON.stringify(usuario)); };
function cerrarSesion() { localStorage.clear(); location.href = 'index.html'; }
const $ = (id) => document.getElementById(id);

async function api(ruta, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(API_URL + ruta, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) cerrarSesion();
    throw new Error(data.error || `Error ${res.status} al llamar a ${ruta}`);
  }
  return data;
}

// Crea elementos con textContent (evita inyectar HTML)
function el(tag, props = {}, ...hijos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  hijos.flat().filter((h) => h != null && h !== false).forEach((h) => e.append(h));
  return e;
}

function urlSegura(u) {
  try { return ['http:', 'https:'].includes(new URL(u).protocol) ? u : null; } catch { return null; }
}

function montarNav() {
  const nav = $('nav');
  const u = getUsuario();
  nav.replaceChildren(el('a', { class: 'btn-nav', href: 'index.html' }, 'INDEX'));
  if (u && u.es_administrador) {
    const sol = el('a', { class: 'btn-nav', href: 'solicitudes.html' }, 'SOLICITUDES');
    nav.append(el('a', { class: 'btn-nav', href: 'admin.html' }, 'ADMIN'), sol);
    api('/personajes/pendientes').then((l) => { if (l.length) sol.textContent = `SOLICITUDES (${l.length})`; }).catch(() => {});
  }
  if (u) nav.append(
    el('span', { class: 'usuario' }, u.nombre + (u.es_administrador ? ' · admin' : '')),
    el('button', { class: 'btn-nav', onclick: cerrarSesion }, 'SALIR')
  );
  else nav.append(el('a', { class: 'btn-nav', href: 'index.html?login=1' }, 'INICIAR SESIÓN'));
}

// Aprobar o rechazar un personaje pendiente (administrador)
async function resolverSolicitud(p, aprobar, despues) {
  try {
    if (aprobar) await api(`/personajes/${p.id}/aprobar`, { method: 'PUT' });
    else {
      const motivo = prompt(`Motivo del rechazo de ${p.nombre} (opcional):`);
      if (motivo === null) return;
      await api(`/personajes/${p.id}/rechazar`, { method: 'PUT', body: { motivo } });
    }
    await despues();
  } catch (e) { alert(e.message); }
}

// Cualquier elemento con data-cerrar cierra su <dialog>
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-cerrar]');
  if (b) b.closest('dialog').close();
});