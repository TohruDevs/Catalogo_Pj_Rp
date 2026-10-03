// Solo administradores
if (!getToken() || !(getUsuario() || {}).es_administrador) location.href = 'index.html';

let usuarios = [];

async function cargar() {
  montarNav();
  try { usuarios = await api('/usuarios'); render(); }
  catch (e) { $('msg').textContent = e.message; }
}

function render() {
  const q = $('buscar').value.trim().toLowerCase();
  const lista = usuarios.filter((u) => `${u.nombre} ${u.correo}`.toLowerCase().includes(q));
  $('lista').replaceChildren(...(lista.length ? lista.map(fila) : [el('li', { class: 'vacio' }, 'No hay usuarios.')]));
}

const fila = (u) => el('li', {},
  el('span', {}, el('strong', {}, u.nombre + (u.es_administrador ? ' · admin' : '')), el('small', { class: 'meta' }, u.correo)),
  el('button', { class: 'chip', onclick: () => editar(u) }, 'EDITAR'));

async function editar(u) {
  const r = await editarUsuarioAdmin(u);
  if (!r) return;
  // Si el administrador se edita a si mismo, se refresca su sesion (y se revisan sus permisos)
  if (r.id === (getUsuario() || {}).id) { guardarSesion(getToken(), r); location.reload(); return; }
  await cargar();
  avisar(`Usuario "${r.nombre}" actualizado.`, 'success');
}

$('buscar').oninput = render;
$('btn-nuevo').onclick = async () => {
  const u = await crearUsuarioAdmin();
  if (!u) return;
  await cargar();
  avisar(`Usuario "${u.nombre}" creado.`, 'success');
};

cargar();