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
    nav.append(el('a', { class: 'btn-nav', href: 'admin.html' }, 'ADMIN'), sol,
      el('a', { class: 'btn-nav', href: 'papelera.html' }, 'PAPELERA'),
      el('a', { class: 'btn-nav', href: 'historial.html' }, 'HISTORIAL'));
    api('/personajes/pendientes').then((l) => { if (l.length) sol.textContent = `SOLICITUDES (${l.length})`; }).catch(() => {});
  }
  if (u) nav.append(
    el('span', { class: 'usuario' }, u.nombre + (u.es_administrador ? ' · admin' : '')),
    el('button', { class: 'btn-nav', onclick: cerrarSesion }, 'SALIR')
  );
  else nav.append(el('a', { class: 'btn-nav', href: 'index.html?login=1' }, 'INICIAR SESIÓN'));
}

// ---------- Alertas con SweetAlert2 (tema oscuro) ----------
const SW = typeof Swal !== 'undefined' ? Swal.mixin({
  background: '#181818', color: '#a29da4', buttonsStyling: false, reverseButtons: true,
  customClass: { popup: 'sw-popup', title: 'sw-titulo', confirmButton: 'sw-btn sw-ok', cancelButton: 'sw-btn', input: 'sw-input' },
}) : null;

// Los <dialog> modales quedan por encima de todo: se cierran mientras se muestra la alerta y se reabren despues
async function conSwal(opciones) {
  const abiertos = [...document.querySelectorAll('dialog[open]')];
  abiertos.forEach((d) => d.close());
  try { return await SW.fire(opciones); }
  finally { abiertos.forEach((d) => { if (!d.open) d.showModal(); }); }
}

const TITULOS = { success: 'Listo', error: 'Error', warning: 'Atención', info: 'Aviso' };

async function avisar(texto, tipo = 'info') {
  if (!SW) return alert(texto);
  await conSwal({ title: TITULOS[tipo], text: texto, icon: tipo, confirmButtonText: 'ACEPTAR' });
}
const avisarError = (texto) => avisar(texto, 'error');

async function confirmar(texto, ok = 'CONFIRMAR') {
  if (!SW) return confirm(texto);
  const r = await conSwal({ title: 'Confirmar', text: texto, icon: 'warning', showCancelButton: true, confirmButtonText: ok, cancelButtonText: 'CANCELAR' });
  return r.isConfirmed;
}

// Devuelve el texto escrito, o null si se cancela
async function pedirTexto(titulo, texto, placeholder = '') {
  if (!SW) return prompt(texto);
  const r = await conSwal({ title: titulo, text: texto, input: 'text', inputPlaceholder: placeholder, showCancelButton: true, confirmButtonText: 'ACEPTAR', cancelButtonText: 'CANCELAR' });
  return r.isConfirmed ? (r.value || '') : null;
}

// Formulario para que el administrador cree un usuario. Devuelve el usuario creado o null
async function crearUsuarioAdmin() {
  if (!SW) {
    const nombre = prompt('Nombre:');
    const correo = nombre && prompt('Correo:');
    const contrasena = correo && prompt('Contraseña (mínimo 6 caracteres):');
    if (!contrasena) return null;
    try { return await api('/usuarios', { method: 'POST', body: { nombre, correo, contrasena } }); }
    catch (e) { alert(e.message); return null; }
  }
  const r = await conSwal({
    title: 'Nuevo usuario',
    html: '<input id="nu-nombre" class="swal2-input" placeholder="Nombre">' +
          '<input id="nu-correo" class="swal2-input" type="email" placeholder="Correo">' +
          '<input id="nu-pass" class="swal2-input" type="password" placeholder="Contraseña (mínimo 6 caracteres)">' +
          '<label class="sw-check"><input id="nu-admin" type="checkbox"> Es administrador</label>',
    focusConfirm: false, showCancelButton: true, confirmButtonText: 'CREAR', cancelButtonText: 'CANCELAR',
    preConfirm: async () => {
      const body = {
        nombre: $('nu-nombre').value.trim(), correo: $('nu-correo').value.trim(),
        contrasena: $('nu-pass').value, es_administrador: $('nu-admin').checked,
      };
      if (!body.nombre || !body.correo || body.contrasena.length < 6) {
        Swal.showValidationMessage('Completa nombre, correo y una contraseña de al menos 6 caracteres');
        return false;
      }
      try { return await api('/usuarios', { method: 'POST', body }); }
      catch (e) { Swal.showValidationMessage(e.message); return false; }
    },
  });
  return r.isConfirmed ? r.value : null;
}

// Aprobar o rechazar un personaje pendiente (administrador)
async function resolverSolicitud(p, aprobar, despues) {
  try {
    if (aprobar) await api(`/personajes/${p.id}/aprobar`, { method: 'PUT' });
    else {
      const motivo = await pedirTexto('Rechazar personaje', `Motivo del rechazo de ${p.nombre} (opcional):`, 'Motivo...');
      if (motivo === null) return;
      await api(`/personajes/${p.id}/rechazar`, { method: 'PUT', body: { motivo } });
    }
    await despues();
  } catch (e) { avisarError(e.message); }
}

// Cualquier elemento con data-cerrar cierra su <dialog>
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-cerrar]');
  if (b) b.closest('dialog').close();
});