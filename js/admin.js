// Solo administradores
if (!getToken() || !(getUsuario() || {}).es_administrador) location.href = 'index.html';
montarNav();

let grupos = [], todos = [], miembros = [], actual = null;

async function iniciar() {
  try {
    [grupos, todos] = await Promise.all([api('/grupos'), api('/usuarios')]);
    if (!grupos.length) { $('msg').textContent = 'Aún no hay grupos. Crea uno desde el index.'; return; }
    await seleccionar(grupos[0].id);
  } catch (e) { $('msg').textContent = e.message; }
}

function renderGrupos() {
  $('lista-grupos').replaceChildren(...grupos.map((g) =>
    el('button', { class: 'chip' + (g.id === actual ? ' activo' : ''), onclick: () => seleccionar(g.id) }, g.nombre)));
}

async function seleccionar(id) {
  actual = id;
  renderGrupos();
  try {
    miembros = await api(`/grupos/${id}/miembros`);
    renderPanel();
  } catch (e) { $('msg').textContent = e.message; }
}

const fila = (u, texto, peligro, accion) => el('li', {},
  el('span', {}, u.nombre + (u.es_administrador ? ' · admin' : '')),
  el('button', { class: 'chip' + (peligro ? ' peligro' : ''), onclick: accion }, texto));

function renderPanel() {
  $('msg').textContent = '';
  $('titulo-grupo').textContent = grupos.find((g) => g.id === actual).nombre;
  $('sub-miembros').textContent = `Miembros (${miembros.length})`;
  $('miembros').replaceChildren(...(miembros.length
    ? miembros.map((m) => fila(m, 'QUITAR', true, () => cambiar('DELETE', `/${m.id}`)))
    : [el('li', { class: 'vacio' }, 'Este grupo aún no tiene miembros.')]));
  renderDisponibles();
}

function renderDisponibles() {
  const ids = new Set(miembros.map((m) => m.id));
  const q = $('buscar').value.trim().toLowerCase();
  const libres = todos.filter((u) => !ids.has(u.id) && u.nombre.toLowerCase().includes(q));
  $('disponibles').replaceChildren(...(libres.length
    ? libres.map((u) => fila(u, 'AGREGAR', false, () => cambiar('POST', '', { id_usuario: u.id })))
    : [el('li', { class: 'vacio' }, 'No hay usuarios para agregar.')]));
}
$('buscar').oninput = renderDisponibles;

$('btn-nuevo-usuario').onclick = async () => {
  const u = await crearUsuarioAdmin();
  if (!u) return;
  todos = await api('/usuarios');
  renderDisponibles();
  avisar(`Usuario "${u.nombre}" creado. Ya puedes agregarlo a un grupo.`, 'success');
};

async function cambiar(metodo, sufijo, body) {
  try {
    await api(`/grupos/${actual}/miembros${sufijo}`, { method: metodo, body });
    miembros = await api(`/grupos/${actual}/miembros`);
    renderPanel();
  } catch (e) { $('msg').textContent = e.message; }
}

iniciar();