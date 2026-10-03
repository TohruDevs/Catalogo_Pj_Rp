// Solo administradores
if (!getToken() || !(getUsuario() || {}).es_administrador) location.href = 'index.html';
montarNav();

const POR_PAGINA = 50;
const TIPOS = [['', 'TODO'], ['grupo', 'GRUPOS'], ['personaje', 'PERSONAJES'], ['miembro', 'MIEMBROS'], ['usuario', 'USUARIOS']];
let tipo = '', ultimoId = null;

function filtros() {
  $('filtros').replaceChildren(...TIPOS.map(([valor, texto]) =>
    el('button', { class: 'chip' + (tipo === valor ? ' activo' : ''), onclick: () => { tipo = valor; filtros(); cargar(true); } }, texto)));
}

const fila = (f) => el('li', {},
  el('span', {}, el('strong', {}, f.usuario || 'Usuario eliminado'), ' — ' + f.descripcion,
    el('small', { class: 'meta' }, new Date(f.fecha).toLocaleString('es'))));

async function cargar(reiniciar) {
  if (reiniciar) { ultimoId = null; $('lista').replaceChildren(); }
  try {
    const q = new URLSearchParams({ limite: POR_PAGINA });
    if (tipo) q.set('tipo', tipo);
    if (ultimoId) q.set('antes', ultimoId);
    const filas = await api('/historial?' + q);
    filas.forEach((f) => $('lista').append(fila(f)));
    if (filas.length) ultimoId = filas[filas.length - 1].id;
    $('mas').hidden = filas.length < POR_PAGINA;
    $('msg').textContent = $('lista').children.length ? '' : 'Todavía no hay acciones registradas.';
  } catch (e) { $('msg').textContent = e.message; }
}

$('mas').onclick = () => cargar(false);
filtros();
cargar(true);