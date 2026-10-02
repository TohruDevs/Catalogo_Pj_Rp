// Solo administradores
if (!getToken() || !(getUsuario() || {}).es_administrador) location.href = 'index.html';

const fecha = (f) => new Date(f).toLocaleString('es');
const vacio = (t) => el('li', { class: 'vacio' }, t);

async function cargar() {
  montarNav();
  try {
    const { grupos, personajes } = await api('/papelera');
    $('lista-grupos').replaceChildren(...(grupos.length ? grupos.map(filaGrupo) : [vacio('No hay grupos en la papelera.')]));
    $('lista-personajes').replaceChildren(...(personajes.length ? personajes.map(filaPersonaje) : [vacio('No hay personajes en la papelera.')]));
  } catch (e) { $('msg').textContent = e.message; }
}

async function accion(ruta, metodo) {
  try { await api(ruta, { method: metodo }); await cargar(); }
  catch (e) { avisarError(e.message); }
}

async function borrarParaSiempre(ruta, texto) {
  if (await confirmar(texto, 'BORRAR')) await accion(ruta, 'DELETE');
}

const fila = (titulo, detalle, restaurar, borrar) => el('li', {},
  el('span', {}, el('strong', {}, titulo), el('small', { class: 'meta' }, detalle)),
  el('div', { class: 'botones' },
    el('button', { class: 'chip activo', onclick: restaurar }, 'RESTAURAR'),
    el('button', { class: 'chip peligro', onclick: borrar }, 'BORRAR PARA SIEMPRE')));

const filaGrupo = (g) => fila(
  g.nombre,
  `${g.total_personajes} personaje(s) · eliminado el ${fecha(g.eliminado_en)}`,
  () => accion(`/papelera/grupos/${g.id}/restaurar`, 'PUT'),
  () => borrarParaSiempre(`/papelera/grupos/${g.id}`,
    `Se borrará "${g.nombre}" con sus ${g.total_personajes} personaje(s) para siempre. No se puede deshacer.`));

const filaPersonaje = (p) => fila(
  p.nombre,
  `Grupo: ${p.grupo}${p.grupo_eliminado ? ' (en la papelera)' : ''} · Jugador: ${p.jugador} · eliminado el ${fecha(p.eliminado_en)}`,
  () => accion(`/papelera/personajes/${p.id}/restaurar`, 'PUT'),
  () => borrarParaSiempre(`/papelera/personajes/${p.id}`,
    `Se borrará "${p.nombre}" para siempre. No se puede deshacer.`));

cargar();