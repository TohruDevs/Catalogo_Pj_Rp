// Decoracion con animales de pixeles. Solo se activa si el <body> lo pide, por ejemplo:
//   <body data-decoracion="mariposas:2,luciernagas:3">   (el numero es la cantidad POR LADO)
// Animales disponibles: aves, mariposas, gatos, buhos, luciernagas
(function () {
  const pedidos = (document.body.dataset.decoracion || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!pedidos.length) return;

  const aleat = (a, b) => a + Math.random() * (b - a);
  const entre = (a, b) => Math.floor(aleat(a, b + 1));
  const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];
  const lados = (n) => Array.from({ length: n }, () => ['izq', 'der']).flat();
  // En el movil no hay margenes libres: los animales se mueven por toda la pantalla (detras del contenido)
  const movil = matchMedia('(max-width:1199px)').matches;
  const posQ = (lado) => (lado === 'izq' ? aleat(0.02, 0.42) : aleat(0.58, 0.94)).toFixed(2);

  // Dibujos: cada letra es un pixel (el punto es transparente). Dos cuadros por animal.
  const SPRITES = {"ave": [["#.........#", "##.......##", ".##..#..##.", "..###o###..", "....###....", ".....#....."], ["....###....", "###.#o#.###", "####.#.####", "##..###..##", "#....#....#", ".....#....."]], "mariposa": [["##..b..##", "###.b.###", "####b####", "###.b.###", ".##.b.##.", "..#.b.#.."], ["....b....", "...#b#...", "...#b#...", "...#b#...", "....b....", "....b...."]], "gato": [["#........#..#.", "#........####.", ".#.......##e#.", "..##########..", "..#########...", "..#########...", "..#..#...#..#.", "..#..#...#..#."], [".#.......#..#.", "#........####.", ".#.......##e#.", "..##########..", "..#########...", "..#########...", "...##.....##..", "...##.....##.."]], "buho": [[".#.......#.", ".#########.", "##eee#eee##", "##eke#eke##", "##eeebeee##", "###########", ".#########.", ".##.###.##.", "..##...##.."], [".#.......#.", ".#########.", "###########", "##eee#eee##", "#####b#####", "###########", ".#########.", ".##.###.##.", "..##...##.."]]};

  // Cada pixel del dibujo es una sombra de una caja de 1 pixel
  function sombras(filas, px, colores) {
    const lista = [];
    filas.forEach((fila, y) => [...fila].forEach((c, x) => {
      if (colores[c]) lista.push(`${x * px}px ${y * px}px 0 ${colores[c]}`);
    }));
    return lista.join(',');
  }

  function cuadros(padre, frames, colores, px) {
    frames.forEach((filas, i) => {
      const f = el('div', { class: i ? 'cuadro cuadro-b' : 'cuadro cuadro-a' });
      f.style.width = f.style.height = `${px}px`;
      f.style.boxShadow = sombras(filas, px, colores);
      padre.append(f);
    });
  }

  const medidas = (frames, px) => [frames[0][0].length * px, frames[0].length * px];

  // Vuela de abajo hacia arriba (o al reves) ondulando, dentro de los margenes laterales
  function volar(lado, frames, colores, o) {
    const px = entre(...o.px), dur = aleat(...o.dur);
    const [w, h] = medidas(frames, px);
    const a = el('div', { class: `animal volador ${lado}` + (Math.random() < 0.4 ? ' baja' : '') });
    a.style.width = `${w}px`;
    a.style.height = `${h}px`;
    a.style.setProperty('--p', aleat(0.04, 0.36).toFixed(2));
    a.style.setProperty('--q', posQ(lado));
    a.style.setProperty('--onda', `${entre(...o.onda)}px`);
    a.style.setProperty('--dur', `${dur.toFixed(1)}s`);
    a.style.setProperty('--retraso', `-${aleat(0, dur).toFixed(1)}s`);
    a.style.setProperty('--aleteo', `${aleat(...o.aleteo).toFixed(2)}s`);
    a.style.setProperty('--desfase', `-${aleat(0, 1).toFixed(2)}s`);
    cuadros(a, frames, colores, px);
    return a;
  }

  // Camina de lado a lado por el borde inferior del margen y se da la vuelta al llegar al final
  function pasear(lado, frames, colores, o) {
    const px = entre(...o.px), dur = aleat(...o.dur);
    const [w, h] = medidas(frames, px);
    const cont = el('div', { class: `caminante ${lado}` });
    cont.style.setProperty('--w', `${w}px`);
    cont.style.setProperty('--h', `${h}px`);
    const paseo = el('div', { class: 'paseo' });
    paseo.style.setProperty('--dur', `${dur.toFixed(1)}s`);
    paseo.style.setProperty('--retraso', `-${aleat(0, dur).toFixed(1)}s`);
    paseo.style.setProperty('--aleteo', `${aleat(0.3, 0.42).toFixed(2)}s`);
    cuadros(paseo, frames, colores, px);
    cont.append(paseo);
    return cont;
  }

  // Se queda quieto en la esquina inferior del margen y parpadea de vez en cuando
  function posar(lado, frames, colores, o) {
    const px = entre(...o.px), ciclo = aleat(4, 8);
    const [w, h] = medidas(frames, px);
    const a = el('div', { class: `animal posado parpadea ${lado}` });
    a.style.width = `${w}px`;
    a.style.height = `${h}px`;
    a.style.setProperty('--p', aleat(0.05, 0.4).toFixed(2));
    a.style.setProperty('--q', posQ(lado));
    a.style.setProperty('--ciclo', `${ciclo.toFixed(1)}s`);
    a.style.setProperty('--desfase', `-${aleat(0, ciclo).toFixed(1)}s`);
    cuadros(a, frames, colores, px);
    return a;
  }

  // Lucecitas que flotan y brillan
  function luz(lado) {
    const l = el('div', { class: `animal luz ${lado}` });
    const dur = aleat(7, 14);
    l.style.top = `${entre(8, 92)}vh`;
    l.style.setProperty('--p', aleat(0.05, 0.45).toFixed(2));
    l.style.setProperty('--q', posQ(lado));
    l.style.setProperty('--dx', `${entre(10, 34)}px`);
    l.style.setProperty('--dy', `${entre(10, 34)}px`);
    l.style.setProperty('--dur', `${dur.toFixed(1)}s`);
    l.style.setProperty('--brillo', `${aleat(2.5, 5).toFixed(1)}s`);
    l.style.setProperty('--retraso', `-${aleat(0, dur).toFixed(1)}s`);
    return l;
  }

  const PALETA_MARIPOSAS = ['#c58fb5', '#7fb5b0', '#d9a86c', '#8fa3d9'];
  const PELAJES = ['#b88a5a', '#8a8f9c', '#d8d2c8', '#6f6a62'];
  const PLUMAS = ['#7a86b8', '#8f9ac4', '#6f7aa8'];

  const FABRICAS = {
    aves: (n) => lados(n).map((lado) => volar(lado, SPRITES.ave, { '#': elegir(PLUMAS), o: '#f0b050' },
      { px: [2, 3], dur: [24, 40], onda: [14, 34], aleteo: [0.45, 0.7] })),
    mariposas: (n) => lados(n).map((lado) => volar(lado, SPRITES.mariposa, { '#': elegir(PALETA_MARIPOSAS), b: '#e9dfe8' },
      { px: [2, 3], dur: [34, 55], onda: [20, 44], aleteo: [0.22, 0.38] })),
    gatos: (n) => lados(n).map((lado) => pasear(lado, SPRITES.gato, { '#': elegir(PELAJES), e: '#7ee07e' },
      { px: [2, 3], dur: [22, 34] })),
    buhos: (n) => lados(n).map((lado) => posar(lado, SPRITES.buho,
      { '#': '#8a6f4e', e: '#f2d16b', k: '#1a1a1a', b: '#e08a3a' }, { px: [3, 4] })),
    luciernagas: (n) => lados(n).map(luz),
  };

  const cont = el('div', { class: 'decoracion', 'aria-hidden': 'true' });
  document.body.append(cont);
  pedidos.forEach((p) => {
    const [nombre, n] = p.split(':');
    const cantidad = Number(n) || 2;
    // En el movil se usa la mitad de animales para que la pantalla no se sienta cargada
    if (FABRICAS[nombre]) cont.append(...FABRICAS[nombre](movil ? Math.max(1, Math.ceil(cantidad / 2)) : cantidad));
  });
})();