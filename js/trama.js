const idGrupo = new URLSearchParams(location.search).get('id');
if (!idGrupo) location.href = 'index.html';
montarNav();
$('volver').href = 'grupo.html?id=' + idGrupo;

let datos = null, editandoZona = null;

async function cargar() {
  try {
    datos = await api('/trama/' + idGrupo);
    document.title = 'Trama · ' + datos.nombre;
    $('titulo').textContent = datos.nombre;
    $('btn-editar-trama').hidden = !datos.es_admin;
    $('btn-nueva-zona').hidden = !datos.puede_gestionar_zonas;
    $('trama').textContent = datos.trama
      || (datos.es_admin ? 'Aún no hay trama. Pulsa EDITAR TRAMA para escribirla.' : 'Aún no hay trama escrita.');
    $('zonas').replaceChildren(...(datos.zonas.length
      ? datos.zonas.map(tarjetaZona)
      : [el('p', { class: 'msg' }, 'Todavía no hay zonas.')]));
  } catch (e) { $('msg').textContent = e.message; }
}

// ---------- Zonas ----------
function tarjetaZona(z) {
  const imgs = (z.imagenes || []).filter(urlSegura);
  const principal = el('div', { class: 'zona-principal' });
  const minis = el('div', { class: 'zona-minis' });
  const mostrar = (i) => {
    principal.replaceChildren(el('img', { src: imgs[i], alt: z.nombre, loading: 'lazy' }));
    [...minis.children].forEach((m, k) => m.classList.toggle('activa', k === i));
  };
  imgs.forEach((u, i) => minis.append(el('button', {
    class: 'mini', type: 'button', onmouseenter: () => mostrar(i), onclick: () => mostrar(i),
  }, el('img', { src: u, alt: '' }))));
  if (imgs.length) mostrar(0);

  return el('article', { class: 'zona' + (imgs.length ? '' : ' sin-galeria') },
    imgs.length ? el('div', { class: 'zona-galeria' }, principal, imgs.length > 1 ? minis : null) : null,
    el('div', { class: 'zona-info' },
      el('h3', {}, z.nombre),
      el('p', { class: 'zona-texto' }, z.descripcion || 'Sin información todavía.'),
      datos.puede_gestionar_zonas && el('div', { class: 'botones' },
        el('button', { class: 'chip', onclick: () => abrirZona(z) }, 'EDITAR'),
        el('button', { class: 'chip peligro', onclick: () => eliminarZona(z) }, 'ELIMINAR'))));
}

const filaImagen = (valor = '') => el('div', { class: 'fila-img' },
  el('input', { type: 'url', placeholder: 'https://...', value: valor }),
  el('button', { type: 'button', class: 'chip peligro', onclick: (e) => e.target.closest('.fila-img').remove() }, '✕'));
$('btn-add-img').onclick = () => $('z-imagenes').append(filaImagen());
$('btn-nueva-zona').onclick = () => abrirZona(null);

function abrirZona(z) {
  editandoZona = z ? z.id : null;
  $('zona-titulo').textContent = z ? 'Editar zona' : 'Nueva zona';
  $('z-nombre').value = z ? z.nombre : '';
  $('z-descripcion').value = z?.descripcion || '';
  $('z-imagenes').replaceChildren(...(z?.imagenes?.length ? z.imagenes : ['']).map((u) => filaImagen(u)));
  $('zona-error').textContent = '';
  $('dlg-zona').showModal();
}

$('form-zona').onsubmit = async (e) => {
  e.preventDefault();
  $('zona-error').textContent = '';
  const body = {
    nombre: $('z-nombre').value.trim(),
    descripcion: $('z-descripcion').value,
    imagenes: [...$('z-imagenes').querySelectorAll('input')].map((i) => i.value.trim()).filter(Boolean),
  };
  try {
    if (editandoZona) await api('/trama/zonas/' + editandoZona, { method: 'PUT', body });
    else await api(`/trama/${idGrupo}/zonas`, { method: 'POST', body });
    $('dlg-zona').close();
    await cargar();
  } catch (err) { $('zona-error').textContent = err.message; }
};

async function eliminarZona(z) {
  if (!(await confirmar(`¿Eliminar la zona "${z.nombre}"? Esta acción no se puede deshacer.`, 'ELIMINAR'))) return;
  try { await api('/trama/zonas/' + z.id, { method: 'DELETE' }); await cargar(); }
  catch (e) { avisarError(e.message); }
}

// ---------- Trama (solo la edita el administrador) ----------
$('btn-editar-trama').onclick = () => {
  $('t-texto').value = datos.trama || '';
  $('trama-error').textContent = '';
  $('dlg-trama').showModal();
};
$('form-trama').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await api('/trama/' + idGrupo, { method: 'PUT', body: { trama: $('t-texto').value } });
    $('dlg-trama').close();
    await cargar();
  } catch (err) { $('trama-error').textContent = err.message; }
};

// ---------- Murcielagos de pixeles (decoracion solo de esta vista) ----------
// Dos cuadros de aleteo; '#' es el cuerpo y 'e' los ojos
const SPRITES = {
  arriba: ['#....#.#....#', '##..#####..##', '###.#e#e#.###', '####.###.####', '.###..#..###.', '..#...#...#..'],
  abajo:  ['.....#.#.....', '#...#####...#', '##..#e#e#..##', '###.#####.###', '.###.###.###.', '..##..#..##..'],
};
const COLORES = { '#': '#8f7a96', e: '#ff5a5a' };

// Cada pixel del dibujo es una sombra de una caja de 1 pixel
function sombras(filas, px) {
  const lista = [];
  filas.forEach((fila, y) => [...fila].forEach((c, x) => {
    if (COLORES[c]) lista.push(`${x * px}px ${y * px}px 0 ${COLORES[c]}`);
  }));
  return lista.join(',');
}

function crearMurcielago(lado) {
  const px = 2 + Math.floor(Math.random() * 3);   // tamano: 2 a 4 px por pixel
  const dur = 16 + Math.random() * 16;            // segundos que tarda en cruzar la pantalla
  const bat = el('div', { class: `murcielago ${lado}` + (Math.random() < 0.4 ? ' baja' : '') });
  bat.style.width = `${13 * px}px`;
  bat.style.height = `${6 * px}px`;
  bat.style.setProperty('--p', (0.04 + Math.random() * 0.36).toFixed(2));   // posicion dentro del margen
  bat.style.setProperty('--onda', `${8 + Math.floor(Math.random() * 18)}px`);
  bat.style.setProperty('--dur', `${dur.toFixed(1)}s`);
  bat.style.setProperty('--retraso', `-${(Math.random() * dur).toFixed(1)}s`);
  bat.style.setProperty('--aleteo', `${(0.35 + Math.random() * 0.25).toFixed(2)}s`);
  ['arriba', 'abajo'].forEach((cuadro, i) => {
    const ala = el('div', { class: i ? 'ala ala-b' : 'ala ala-a' });
    ala.style.width = ala.style.height = `${px}px`;
    ala.style.boxShadow = sombras(SPRITES[cuadro], px);
    bat.append(ala);
  });
  return bat;
}

$('murcielagos').append(
  ...['izq', 'izq', 'izq', 'der', 'der', 'der'].map(crearMurcielago));

cargar();