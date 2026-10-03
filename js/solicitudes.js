// El servidor entrega solo las solicitudes que cada persona puede revisar (administrador o moderador)
if (!getToken()) location.href = 'index.html';

async function cargar() {
  montarNav();
  try {
    const lista = await api('/personajes/pendientes');
    $('msg').textContent = lista.length ? '' : 'No hay solicitudes pendientes.';
    $('grid').replaceChildren(...lista.map(tarjetaSolicitud));
  } catch (e) { $('msg').textContent = e.message; }
}

function tarjetaSolicitud(p) {
  const url = urlSegura((p.imagenes || [])[0]);
  return el('article', { class: 'card', style: 'cursor:default' },
    url ? el('img', { class: 'portada', src: url, alt: p.nombre })
        : el('div', { class: 'portada sin-imagen' }, p.nombre.charAt(0).toUpperCase()),
    el('div', { class: 'info' },
      el('h3', {}, p.nombre),
      el('p', { class: 'meta' }, 'Grupo: ' + p.grupo),
      el('p', { class: 'meta' }, 'Jugador: ' + p.jugador),
      el('p', { class: 'meta' }, 'Universo: ' + p.universo_origen),
      p.solicita_ingreso && el('p', { class: 'meta aviso pendiente' }, 'También solicita unirse al grupo'),
      el('p', {}, p.descripcion || '')),
    el('div', { class: 'botones', style: 'padding:0 14px 14px' },
      el('button', { class: 'chip activo', onclick: () => resolverSolicitud(p, true, cargar) }, 'APROBAR'),
      el('button', { class: 'chip peligro', onclick: () => resolverSolicitud(p, false, cargar) }, 'RECHAZAR'),
      el('a', { class: 'chip', href: 'grupo.html?id=' + p.id_grupo }, 'VER GRUPO')));
}

cargar();