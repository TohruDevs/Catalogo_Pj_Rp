const idGrupo = new URLSearchParams(location.search).get('id');
if (!idGrupo) location.href = 'index.html';
montarNav();
const usuario = getUsuario() || {};
let grupo = null, universos = [], filtro = 'todos', filtroJugador = 'todos', editandoId = null;

async function cargar() {
  try {
    grupo = await api('/grupos/' + idGrupo);
    document.title = grupo.nombre;
    $('titulo').textContent = grupo.nombre;
    $('descripcion').textContent = grupo.descripcion || '';
    $('btn-nuevo').hidden = !getToken();
    $('btn-miembros').hidden = !grupo.puede_moderar;
    $('btn-miembros').textContent = usuario.es_administrador ? 'ADMINISTRAR MIEMBROS' : 'INVITAR USUARIOS';
    $('btn-eliminar-grupo').hidden = !usuario.es_administrador;
    $('btn-editar-grupo').hidden = !usuario.es_administrador;
    render();
  } catch (e) { $('msg').textContent = e.message; }
}

const chip = (texto, valor) =>
  el('button', { class: 'chip' + (filtro === valor ? ' activo' : ''), onclick: () => { filtro = valor; render(); } }, texto.toUpperCase());

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function render() {
  const todos = grupo.personajes;
  const deGrupo = new Map(todos.map((p) => [String(p.id_universo_origen), p.universo_origen]));
  if (filtro !== 'todos' && !deGrupo.has(filtro)) filtro = 'todos';
  $('chips').replaceChildren(chip('ALL', 'todos'),
    ...[...deGrupo].sort((a, b) => a[1].localeCompare(b[1])).map(([id, n]) => chip(n, id)));
  // Filtro por jugador
  const jugadores = new Map(todos.map((p) => [String(p.id_jugador), p.jugador]));
  if (filtroJugador !== 'todos' && !jugadores.has(filtroJugador)) filtroJugador = 'todos';
  $('filtro-jugador').replaceChildren(el('option', { value: 'todos' }, 'Todos los jugadores'),
    ...[...jugadores].sort((a, b) => a[1].localeCompare(b[1])).map(([id, n]) => el('option', { value: id }, n)));
  $('filtro-jugador').value = filtroJugador;
  const q = norm($('busqueda').value.trim());
  const visibles = todos.filter((p) =>
    (filtro === 'todos' || String(p.id_universo_origen) === filtro) &&
    (filtroJugador === 'todos' || String(p.id_jugador) === filtroJugador) && norm(p.nombre).includes(q));
  $('grid').replaceChildren(...visibles.map(tarjeta));
  $('msg').textContent = !todos.length ? 'Este grupo aún no tiene personajes.'
    : !visibles.length ? 'Ningún personaje coincide con la búsqueda.' : '';
}

function portada(p) {
  const url = urlSegura((p.imagenes || [])[0]);
  const vacio = () => el('div', { class: 'portada sin-imagen' }, p.nombre.charAt(0).toUpperCase());
  return url
    ? el('img', { class: 'portada', src: url, alt: p.nombre, loading: 'lazy', onerror: (e) => e.target.replaceWith(vacio()) })
    : vacio();
}

function tarjeta(p) {
  return el('article', {
    class: 'card card-fija', tabindex: '0', onclick: () => abrirDetalle(p),
    onkeydown: (e) => { if (e.key === 'Enter') abrirDetalle(p); },
  },
    p.estado !== 'aprobado' && el('span', { class: 'insignia ' + p.estado }, p.estado),
    portada(p),
    el('div', { class: 'info' }, el('h3', { title: p.nombre }, p.nombre)),
    el('div', { class: 'pie' }, p.universo_origen));
}

// ---------- Detalle estilo tienda: miniaturas + imagen principal + informacion ----------
function abrirDetalle(p) {
  const imgs = (p.imagenes || []).filter(urlSegura);
  const puedeEditar = usuario.es_administrador || p.id_jugador === usuario.id;
  const despues = async () => { $('dlg-detalle').close(); await cargar(); montarNav(); };
  const pantalla = el('div', { class: 'galeria-principal' });
  const minis = el('div', { class: 'miniaturas' });
  let actual = 0;
  const mostrar = (i) => {
    actual = (i + imgs.length) % imgs.length;
    pantalla.replaceChildren(el('img', { src: imgs[actual], alt: p.nombre }));
    [...minis.children].forEach((m, k) => m.classList.toggle('activa', k === actual));
  };
  if (imgs.length) {
    imgs.forEach((u, i) => minis.append(el('button', {
      class: 'mini', type: 'button', onmouseenter: () => mostrar(i), onclick: () => mostrar(i),
    }, el('img', { src: u, alt: '' }))));
    mostrar(0);
  } else {
    pantalla.append(el('div', { class: 'sin-imagen' }, p.nombre.charAt(0).toUpperCase()));
  }
  const flechas = imgs.length > 1 ? [
    el('button', { class: 'flecha izq', type: 'button', onclick: () => mostrar(actual - 1) }, '‹'),
    el('button', { class: 'flecha der', type: 'button', onclick: () => mostrar(actual + 1) }, '›'),
  ] : [];

  $('detalle').replaceChildren(
    el('div', { class: 'visor' }, imgs.length > 1 ? minis : null,
      el('div', { class: 'principal-wrap' }, pantalla, ...flechas)),
    el('div', {},
      el('h2', {}, p.nombre),
      el('p', { class: 'meta' }, 'Universo: ' + p.universo_origen),
      el('p', { class: 'meta' }, 'Jugador: ' + p.jugador),
      p.estado !== 'aprobado' && el('p', { class: 'meta aviso ' + p.estado },
        p.estado === 'pendiente' ? 'Pendiente de aprobación del administrador'
          : 'Rechazado' + (p.motivo_rechazo ? ': ' + p.motivo_rechazo : '')),
      el('p', { class: 'info' }, p.descripcion || 'Sin descripción.'),
      el('div', { class: 'botones' },
        grupo.puede_moderar && p.estado === 'pendiente' && el('button', { class: 'chip activo', onclick: () => resolverSolicitud(p, true, despues) }, 'APROBAR'),
        grupo.puede_moderar && p.estado === 'pendiente' && el('button', { class: 'chip peligro', onclick: () => resolverSolicitud(p, false, despues) }, 'RECHAZAR'),
        puedeEditar && el('button', { class: 'chip', onclick: () => abrirFormulario(p) }, 'EDITAR'),
        puedeEditar && el('button', { class: 'chip peligro', onclick: () => eliminar(p) }, 'ELIMINAR'),
        el('button', { class: 'chip', 'data-cerrar': '' }, 'CERRAR'))));
  $('dlg-detalle').showModal();
}

async function eliminar(p) {
  if (!(await confirmar(`${p.nombre} irá a la papelera. Podrás restaurarlo desde ahí.`, 'ELIMINAR'))) return;
  try { await api('/personajes/' + p.id, { method: 'DELETE' }); $('dlg-detalle').close(); await cargar(); }
  catch (e) { avisarError(e.message); }
}

// ---------- Crear / editar personaje ----------
const actualizarNuevo = () => {
  const nuevo = $('f-universo').value === 'nuevo';
  $('wrap-nuevo').hidden = !nuevo;
  $('f-nuevo').required = nuevo;
};
$('f-universo').onchange = actualizarNuevo;
$('btn-nuevo').onclick = () => abrirFormulario(null);

const filaImagen = (valor = '') => el('div', { class: 'fila-img' },
  el('input', { type: 'url', placeholder: 'https://...', value: valor }),
  el('button', { type: 'button', class: 'chip peligro', onclick: (e) => e.target.closest('.fila-img').remove() }, '✕'));
$('btn-add-img').onclick = () => $('f-imagenes').append(filaImagen());

async function abrirFormulario(p) {
  $('dlg-detalle').close();
  editandoId = p ? p.id : null;
  $('form-titulo').textContent = p ? 'Editar personaje' : 'Nuevo personaje';
  $('form-error').textContent = '';
  let miembros = [];
  try {
    universos = await api('/universos');
    if (usuario.es_administrador) miembros = await api(`/grupos/${idGrupo}/miembros`);
  } catch (e) { return avisarError(e.message); }

  $('f-universo').replaceChildren(
    ...universos.map((u) => el('option', { value: u.id }, u.nombre)),
    el('option', { value: 'nuevo' }, '+ Nuevo universo...'));
  $('f-nombre').value = p ? p.nombre : '';
  $('f-descripcion').value = p?.descripcion || '';
  $('f-nuevo').value = '';
  $('f-universo').value = p ? String(p.id_universo_origen) : (universos[0] ? String(universos[0].id) : 'nuevo');
  actualizarNuevo();
  $('f-imagenes').replaceChildren(...(p?.imagenes?.length ? p.imagenes : ['']).map((u) => filaImagen(u)));

  // Solo el administrador puede asignar el personaje a un jugador del grupo
  $('wrap-jugador').hidden = !usuario.es_administrador;
  if (usuario.es_administrador) {
    const sel = $('f-jugador');
    const opciones = miembros.map((m) => el('option', { value: m.id }, m.nombre));
    if (p && !miembros.some((m) => m.id === p.id_jugador)) opciones.push(el('option', { value: p.id_jugador }, p.jugador));
    sel.replaceChildren(...opciones);
    sel.value = String(p ? p.id_jugador : usuario.id);
    if (!sel.value && opciones.length) sel.selectedIndex = 0;
  }
  $('dlg-personaje').showModal();
}

$('form-personaje').onsubmit = async (e) => {
  e.preventDefault();
  $('form-error').textContent = '';
  try {
    let idUniverso = $('f-universo').value;
    if (idUniverso === 'nuevo') {
      const nombre = $('f-nuevo').value.trim();
      const existente = universos.find((u) => u.nombre.toLowerCase() === nombre.toLowerCase());
      idUniverso = existente ? existente.id
        : (await api('/universos', { method: 'POST', body: { nombre } })).id;
    }
    const body = {
      nombre: $('f-nombre').value,
      descripcion: $('f-descripcion').value,
      imagenes: [...$('f-imagenes').querySelectorAll('input')].map((i) => i.value.trim()).filter(Boolean),
      id_universo_origen: Number(idUniverso),
    };
    if (usuario.es_administrador && $('f-jugador').value) body.id_jugador = Number($('f-jugador').value);
    const r = editandoId
      ? await api('/personajes/' + editandoId, { method: 'PUT', body })
      : await api('/personajes', { method: 'POST', body: { ...body, id_grupo: Number(idGrupo) } });
    $('dlg-personaje').close();
    await cargar();
    if (!usuario.es_administrador && r.estado === 'pendiente') {
      avisar(r.solicita_ingreso
        ? 'Tu personaje y tu solicitud para unirte al grupo fueron enviados al administrador. Cuando lo apruebe, el personaje aparecerá y serás parte del grupo.'
        : 'Tu personaje fue enviado al administrador para su aprobación. Aparecerá en el grupo cuando lo apruebe.', 'success');
    }
  } catch (err) { $('form-error').textContent = err.message; }
};

// ---------- Panel de miembros (administrador y moderadores) ----------
let miembrosGrupo = [], candidatos = [];
$('btn-nuevo-usuario').hidden = !usuario.es_administrador;

$('btn-miembros').onclick = async () => {
  $('panel-admin').hidden = !$('panel-admin').hidden;
  if (!$('panel-admin').hidden) await cargarPanel();
};

async function cargarPanel() {
  try {
    [miembrosGrupo, candidatos] = await Promise.all([
      api(`/grupos/${idGrupo}/miembros`), api(`/grupos/${idGrupo}/candidatos`)]);
    renderPanel();
  } catch (e) { avisarError(e.message); }
}

// El administrador puede nombrar moderadores y quitar miembros; el moderador solo ve la lista
function filaMiembro(m) {
  const esMod = m.rol === 'moderador';
  return el('li', {},
    el('span', {}, m.nombre + (esMod ? ' · moderador' : '')),
    usuario.es_administrador && el('div', { class: 'botones' },
      el('button', { class: 'chip', onclick: () => cambiarMiembro('PUT', `/${m.id}`, { rol: esMod ? 'jugador' : 'moderador' }) },
        esMod ? 'QUITAR MODERADOR' : 'HACER MODERADOR'),
      el('button', { class: 'chip peligro', onclick: () => cambiarMiembro('DELETE', `/${m.id}`) }, 'QUITAR')));
}

function renderPanel() {
  $('sub-miembros').textContent = `Miembros (${miembrosGrupo.length})`;
  $('miembros').replaceChildren(...(miembrosGrupo.length
    ? miembrosGrupo.map(filaMiembro)
    : [el('li', { class: 'vacio' }, 'Este grupo aún no tiene miembros.')]));
  renderDisponibles();
}

function renderDisponibles() {
  const q = $('buscar').value.trim().toLowerCase();
  const libres = candidatos.filter((u) => u.nombre.toLowerCase().includes(q));
  $('disponibles').replaceChildren(...(libres.length
    ? libres.map((u) => el('li', {}, el('span', {}, u.nombre),
        el('button', { class: 'chip', onclick: () => cambiarMiembro('POST', '', { id_usuario: u.id }) }, 'AGREGAR')))
    : [el('li', { class: 'vacio' }, 'No hay usuarios para agregar.')]));
}
$('buscar').oninput = renderDisponibles;

$('btn-nuevo-usuario').onclick = async () => {
  const u = await crearUsuarioAdmin();
  if (!u) return;
  await cargarPanel();
  avisar(`Usuario "${u.nombre}" creado. Ya puedes agregarlo al grupo.`, 'success');
};

async function cambiarMiembro(metodo, sufijo, body) {
  try {
    await api(`/grupos/${idGrupo}/miembros${sufijo}`, { method: metodo, body });
    await cargarPanel();
  } catch (e) { avisarError(e.message); }
}

// ---------- Editar grupo (solo administrador) ----------
$('btn-editar-grupo').onclick = () => {
  $('g-nombre').value = grupo.nombre;
  $('g-desc').value = grupo.descripcion || '';
  $('grupo-error').textContent = '';
  $('dlg-grupo').showModal();
};
$('form-grupo').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await api('/grupos/' + idGrupo, { method: 'PUT', body: { nombre: $('g-nombre').value.trim(), descripcion: $('g-desc').value } });
    $('dlg-grupo').close();
    await cargar();
  } catch (err) { $('grupo-error').textContent = err.message; }
};

// ---------- Eliminar grupo (solo administrador) ----------
$('btn-eliminar-grupo').onclick = async () => {
  const n = grupo.personajes.length;
  if (!(await confirmar(`El grupo "${grupo.nombre}" y sus ${n} personaje(s) irán a la papelera. Podrás restaurarlos desde ahí.`, 'ELIMINAR'))) return;
  try {
    await api('/grupos/' + idGrupo, { method: 'DELETE' });
    location.href = 'index.html';
  } catch (e) { avisarError(e.message); }
};

$('busqueda').oninput = render;
$('filtro-jugador').onchange = (e) => { filtroJugador = e.target.value; render(); };
cargar();