// Decoracion con animales de pixeles + decoracion por epoca (la activa el administrador).
//   <body data-decoracion="mariposas:2,luciernagas:3">   -> animales de cada vista (numero = cantidad POR LADO)
// Animales: aves, mariposas, gatos, buhos, luciernagas.  Epocas: halloween.
(async function () {
  const pedidos = (document.body.dataset.decoracion || '').split(',').map((s) => s.trim()).filter(Boolean);

  // ---------- Epoca activa ----------
  const CLASES_EPOCA = { halloween: 'epoca-halloween', navidad: 'epoca-navidad', genshin: 'epoca-genshin' };

  async function consultarEpoca() {
    try {
      const r = await api('/configuracion');
      sessionStorage.setItem('epoca', r.epoca || 'ninguna');
      return r.epoca || '';
    } catch { return null; }   // null = no se pudo consultar
  }

  let epoca;
  const guardada = sessionStorage.getItem('epoca');
  if (guardada !== null) {
    epoca = guardada === 'ninguna' ? '' : guardada;
    consultarEpoca();   // se refresca para la siguiente pagina
  } else {
    epoca = await Promise.race([consultarEpoca(), new Promise((r) => setTimeout(() => r(null), 1500))]);
  }
  if (!CLASES_EPOCA[epoca]) epoca = '';
  if (epoca) document.body.classList.add(CLASES_EPOCA[epoca]);
  if (!epoca && !pedidos.length) return;

  const aleat = (a, b) => a + Math.random() * (b - a);
  const entre = (a, b) => Math.floor(aleat(a, b + 1));
  const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];
  const lados = (n) => Array.from({ length: n }, () => ['izq', 'der']).flat();
  // En el movil no hay margenes libres: los animales se mueven por toda la pantalla (detras del contenido)
  const movil = matchMedia('(max-width:1199px)').matches;
  const posQ = (lado) => (lado === 'izq' ? aleat(0.02, 0.42) : aleat(0.58, 0.94)).toFixed(2);

  // Dibujos: cada letra es un pixel (el punto es transparente). Dos cuadros por animal.
  const SPRITES = {"ave": [["#.........#", "##.......##", ".##..#..##.", "..###o###..", "....###....", ".....#....."], ["....###....", "###.#o#.###", "####.#.####", "##..###..##", "#....#....#", ".....#....."]], "mariposa": [["##..b..##", "###.b.###", "####b####", "###.b.###", ".##.b.##.", "..#.b.#.."], ["....b....", "...#b#...", "...#b#...", "...#b#...", "....b....", "....b...."]], "gato": [["#........#..#.", "#........####.", ".#.......##e#.", "..##########..", "..#########...", "..#########...", "..#..#...#..#.", "..#..#...#..#."], [".#.......#..#.", "#........####.", ".#.......##e#.", "..##########..", "..#########...", "..#########...", "...##.....##..", "...##.....##.."]], "buho": [[".#.......#.", ".#########.", "##eee#eee##", "##eke#eke##", "##eeebeee##", "###########", ".#########.", ".##.###.##.", "..##...##.."], [".#.......#.", ".#########.", "###########", "##eee#eee##", "#####b#####", "###########", ".#########.", ".##.###.##.", "..##...##.."]], "calabaza": [[".....s.....", "...#####...", ".#########.", "##yy###yy##", "##yy###yy##", "###########", "#yy#yyy#yy#", ".#########.", "..#######.."], [".....s.....", "...#####...", ".#########.", "##dd###dd##", "##dd###dd##", "###########", "#dd#ddd#dd#", ".#########.", "..#######.."]], "fantasma": [["..#####..", ".#######.", "#########", "##kk#kk##", "##kk#kk##", "####k####", "#########", "#########", "#.#.#.#.#"], ["..#####..", ".#######.", "#########", "##kk#kk##", "##kk#kk##", "####k####", "#########", "#########", ".#.#.#.#."]], "arana": [[".#.....#.", "#..###..#", "#.#####.#", ".#.#r#.#.", "#..###..#", ".#.....#."], ["#.......#", ".#.###.#.", "#.#####.#", ".#.#r#.#.", ".#.###.#.", "#.......#"]], "murcielago": [["#....#.#....#", "##..#####..##", "###.#e#e#.###", "####.###.####", ".###..#..###.", "..#...#...#.."], [".....#.#.....", "#...#####...#", "##..#e#e#..##", "###.#####.###", ".###.###.###.", "..##..#..##.."]], "telarana": [["################", "####.#...#...#..", "###.###..#...#..", "##.##.####...#..", "#.###...#####...", "###..#.##..###..", "#.##..##...##.#.", "#..#.###...#....", "#..###..#.#.....", "#####....##.....", "#...#...###.....", "#...####........", "#...###.........", "####.#..........", "#.....#.........", "#..............."]], "arbol": [[".....y.....", "....###....", "...##r##...", "..#######..", "..###u###..", ".#########.", ".##o#####r.", "###########", "##r######u#", "###########", "....ttt....", "....ttt...."], [".....y.....", "....###....", "...##u##...", "..#######..", "..###r###..", ".#########.", ".##o#####u.", "###########", "##u######r#", "###########", "....ttt....", "....ttt...."]], "muneco": [["...hhh...", "...hhh...", "..hhhhh..", "..wwwww..", "..wkwkw..", "..wwoww..", ".ccccccc.", "swwwwwwws", ".wwwkwww.", "wwwwwwwww", "wwwwkwwww", "wwwwwwwww", ".wwwwwww."], ["...hhh...", "...hhh...", "..hhhhh..", "..wwwww..", "..wkwkw..", "..wwoww..", "scccccccs", ".wwwwwww.", ".wwwkwww.", "wwwwwwwww", "wwwwkwwww", "wwwwwwwww", ".wwwwwww."]], "copo": [[".#.", "###", ".#."]], "el_anemo": [["######.", "#....#.", "#.##.#.", "#.#..#.", "#.####.", "#......", "#######"], ["#######", "......#", ".####.#", ".#..#.#", ".#.##.#", ".#....#", ".######"]], "el_geo": [["...#...", "..#w#..", ".#w###.", "#######", ".#####.", "..###..", "...#..."], ["...#...", "..###..", ".##w##.", "##w####", ".#####.", "..###..", "...#..."]], "el_electro": [["..#####", "..####.", ".####..", ".######", "...###.", "..###..", "..##...", ".##....", ".#....."], ["..#####", "..#ww#.", ".#ww#..", ".######", "...#w#.", "..#w#..", "..##...", ".##....", ".#....."]], "el_dendro": [["...#...", "..###..", ".##w##.", ".##w##.", "###w###", "###w###", ".##w##.", "..#w#..", "...s..."], ["...#...", "..###..", ".#####.", ".#####.", "###w###", "###w###", ".#####.", "..###..", "...s..."]], "el_hydro": [["...#...", "...#...", "..###..", "..###..", ".#####.", "#w#####", "#######", ".#####.", "..###.."], ["...#...", "...#...", "..###..", "..###..", ".#####.", "#######", "#w#####", ".#####.", "..###.."]], "el_pyro": [["...#...", "..##..#", "..###.#", ".#####.", ".##w##.", "##www##", "##www##", ".#www#.", "..###.."], ["..#....", "..##...", "#.###..", ".#####.", ".##w##.", "##www##", "##www##", ".#www#.", "..###.."]], "el_cryo": [["#..#..#", ".#.#.#.", "..###..", "#######", "..###..", ".#.#.#.", "#..#..#"], ["#..#..#", ".#.#.#.", "..#w#..", "##www##", "..#w#..", ".#.#.#.", "#..#..#"]], "slime": [["...#####...", "..#w#####..", ".#########.", ".##k###k##.", ".##k###k##.", ".#########.", "..#######.."], ["...........", "...........", "..#######..", ".#w#######.", "##k#####k##", "###########", ".#########."]], "brillo": [["..#..", ".###.", "#####", ".###.", "..#.."]], "semilla": [["#..#..#", ".#.#.#.", "..###..", "...#...", "...#..."], ["#..#..#", ".#.#.#.", "..###..", "...#...", "..#...."]]};

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
    const a = el('div', { class: `animal volador ${lado}` + (o.clase ? ` ${o.clase}` : '') + (!o.sube && Math.random() < 0.4 ? ' baja' : '') });
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

  // Se queda quieto en la esquina inferior del margen y parpadea (o titila) de vez en cuando
  function posar(lado, frames, colores, o) {
    const px = entre(...o.px), ciclo = aleat(...(o.ciclo || [4, 8]));
    const [w, h] = medidas(frames, px);
    const a = el('div', { class: `animal posado ${o.alterna ? '' : 'parpadea '}${lado}` });
    a.style.width = `${w}px`;
    a.style.height = `${h}px`;
    a.style.setProperty('--p', aleat(0.05, 0.4).toFixed(2));
    a.style.setProperty('--q', posQ(lado));
    a.style.setProperty('--ciclo', `${ciclo.toFixed(1)}s`);
    a.style.setProperty('--desfase', `-${aleat(0, ciclo).toFixed(1)}s`);
    if (o.alterna) a.style.setProperty('--aleteo', `${aleat(0.7, 1.1).toFixed(2)}s`);   // alterna los dos cuadros sin parpadear
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

  // Aranas que cuelgan de un hilo desde arriba y suben y bajan
  function colgar(lado) {
    const px = entre(2, 3), HILO = 260;
    const [w, h] = medidas(SPRITES.arana, px);
    const dur = aleat(6, 11);
    const a = el('div', { class: `animal arana ${lado}` });
    a.style.width = `${w}px`;
    a.style.height = `${HILO + h}px`;
    a.style.top = `-${HILO}px`;
    a.style.setProperty('--p', aleat(0.05, 0.4).toFixed(2));
    a.style.setProperty('--q', posQ(lado));
    a.style.setProperty('--baja', `${entre(70, 190)}px`);
    a.style.setProperty('--dur', `${dur.toFixed(1)}s`);
    a.style.setProperty('--retraso', `-${aleat(0, dur).toFixed(1)}s`);
    a.style.setProperty('--aleteo', `${aleat(0.4, 0.7).toFixed(2)}s`);
    const hilo = el('div', { class: 'hilo' });
    hilo.style.height = `${HILO}px`;
    hilo.style.left = `${Math.floor(w / 2)}px`;
    const cuerpo = el('div', { class: 'cuerpo-arana' });
    cuerpo.style.top = `${HILO}px`;
    cuerpo.style.width = `${w}px`;
    cuerpo.style.height = `${h}px`;
    cuadros(cuerpo, SPRITES.arana, { '#': '#7a6a8c', r: '#ff4d4d' }, px);
    a.append(hilo, cuerpo);
    return a;
  }

  // Telaranas en las dos esquinas de arriba
  function telaranas() {
    const px = movil ? 3 : 4;
    return ['izq', 'der'].map((lado) => {
      const filas = lado === 'izq' ? SPRITES.telarana[0] : SPRITES.telarana[0].map((f) => [...f].reverse().join(''));
      const w = el('div', { class: `telarana ${lado}` });
      w.style.width = w.style.height = `${filas.length * px}px`;
      const celda = el('div', { class: 'cuadro-fijo' });
      celda.style.width = celda.style.height = `${px}px`;
      celda.style.boxShadow = sombras(filas, px, { '#': '#d8d0e4' });
      w.append(celda);
      return w;
    });
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

  // ---------- Halloween: reemplaza a los animales de la vista ----------
  function halloween() {
    const enTrama = document.body.classList.contains('pagina-trama');   // alli ya hay murcielagos propios
    return [
      ...telaranas(),
      ...lados(1).map((lado) => posar(lado, SPRITES.calabaza,
        { '#': '#e07a1f', s: '#5b8a3a', y: '#ffe27a', d: '#8a4310' }, { px: [3, 4], ciclo: [1.5, 3] })),
      ...lados(1).map((lado) => volar(lado, SPRITES.fantasma, { '#': '#e8e4f0', k: '#2a2a3a' },
        { px: [3, 4], dur: [40, 60], onda: [16, 36], aleteo: [0.7, 1.1], clase: 'fantasma' })),
      ...lados(1).map(colgar),
      ...(enTrama ? [] : lados(1).map((lado) => volar(lado, SPRITES.murcielago, { '#': '#9b6fb5', e: '#ff9a2e' },
        { px: [2, 3], dur: [16, 30], onda: [8, 26], aleteo: [0.35, 0.6] }))),
    ];
  }

  // ---------- Navidad: reemplaza a los animales de la vista ----------
  // Copos de nieve que caen con un poco de vaiven
  function nevar(lado) {
    const px = entre(1, 2), dur = aleat(10, 20);
    const filas = SPRITES.copo[0];
    const c = el('div', { class: `animal volador baja copo ${lado}` });
    c.style.width = c.style.height = `${filas.length * px}px`;
    c.style.setProperty('--p', aleat(0.04, 0.4).toFixed(2));
    c.style.setProperty('--q', posQ(lado));
    c.style.setProperty('--onda', `${entre(6, 20)}px`);
    c.style.setProperty('--dur', `${dur.toFixed(1)}s`);
    c.style.setProperty('--retraso', `-${aleat(0, dur).toFixed(1)}s`);
    const celda = el('div', { class: 'cuadro-fijo' });
    celda.style.width = celda.style.height = `${px}px`;
    celda.style.boxShadow = sombras(filas, px, { '#': '#ffffff' });
    c.append(celda);
    return c;
  }

  // Guirnalda de luces en el borde de arriba, que cambian de color
  function guirnalda() {
    const g = el('div', { class: 'guirnalda' });
    g.append(el('div', { class: 'luces luces-a' }), el('div', { class: 'luces luces-b' }));
    return g;
  }

  function navidad() {
    return [
      guirnalda(),
      ...lados(movil ? 3 : 5).map(nevar),
      posar('izq', SPRITES.arbol,
        { '#': '#2f8a4a', y: '#ffe27a', r: '#e04a4a', u: '#5aa0ff', o: '#ffd24a', t: '#7a4a2a' }, { px: [3, 4], alterna: true }),
      posar('der', SPRITES.muneco,
        { h: '#4a4a5a', w: '#f4f7fb', k: '#2a2a3a', o: '#f08a2e', c: '#e04a4a', s: '#8a5a2a' }, { px: [3, 4], alterna: true }),
    ];
  }

  // ---------- Genshin Impact: simbolos elementales, slimes y estrellas (dibujos propios inspirados en la tematica) ----------
  const ELEMENTOS = {"anemo": {"#": "#7fe8d0"}, "geo": {"#": "#e8c34a", "w": "#fff2b0"}, "electro": {"#": "#b07aff", "w": "#f0e2ff"}, "dendro": {"#": "#5fbf5a", "w": "#c9f5a0", "s": "#7a5a3a"}, "hydro": {"#": "#4aa8ff", "w": "#d6ecff"}, "pyro": {"#": "#e8563a", "w": "#ffd36a"}, "cryo": {"#": "#8fd6ff", "w": "#ffffff"}};

  // ---------- Los 7 arcontes (figuras chibi de pixeles, inspiradas en cada uno) ----------
  // Cada arconte: colores + 'tope' (fila superior de la cabeza) + 'extra' (pixeles sueltos [fila, col, letra])
  const ARCONTES = {
    venti: {
      glow: '#7fe8d0', tope: '..aaaaaw.', extra: [],
      col: { h: '#3d6e78', a: '#5fcf9a', c: '#2f6f5a', s: '#f2d2b0', k: '#1a2a3a', w: '#ffffff' } },
    zhongli: {
      glow: '#e8c34a', tope: '.........', extra: [[4, 8, 'h'], [5, 8, 'h']],
      col: { h: '#3a2a1e', a: '#e8a83a', c: '#4a3a2a', s: '#f0cfa8', k: '#e8a83a' } },
    raiden: {
      glow: '#b07aff', tope: '...aaa...', extra: [[4, 8, 'h'], [5, 8, 'h']],
      col: { h: '#5a3a8a', a: '#d08aff', c: '#6a3fa0', s: '#f2d6c4', k: '#e0b0ff' } },
    nahida: {
      glow: '#7fd45a', tope: '....aa...', extra: [[3, 0, 'h'], [4, 0, 'h']],
      col: { h: '#f2f2f2', a: '#7fd45a', c: '#f2f2f2', s: '#f4dcc8', k: '#5fbf5a' } },
    furina: {
      glow: '#4aa8ff', tope: '..aaaaa..', extra: [[4, 0, 'h'], [4, 8, 'h']],
      col: { h: '#e8f2ff', a: '#4aa8ff', c: '#1f3f8a', s: '#f4dcd0', k: '#4aa8ff' } },
    mavuika: {
      glow: '#e8563a', tope: '..a.a.a..', extra: [],
      col: { h: '#2a1a1a', a: '#ff7a2a', c: '#c23a1a', s: '#d9a070', k: '#ffd36a' } },
    tsaritsa: {
      glow: '#8fd6ff', tope: '.a.a.a.a.', extra: [[4, 0, 'h'], [4, 8, 'h']],
      col: { h: '#e8f4ff', a: '#8fd6ff', c: '#4a6ab0', s: '#f4e6ee', k: '#2a4a8a' } },
  };

  // Arma los dos cuadros de la figura a partir de una base comun
  function figuraArconte({ tope, extra }) {
    const cuerpo = [
      '..hhhhh..', '.hhhhhhh.', '.hsksksh.', '.hsssssh.',
      '..ccccc..', '.sccaccs.', '.cccaccc.', '..ccccc..',
    ];
    const frameA = [tope, ...cuerpo, '..cc.cc..'];
    const frameB = [tope, ...cuerpo.slice(0, 4), '..ccccc..', 's.ccacc.s', '.cccaccc.', '..ccccc..', '..c...c..'];
    return [frameA, frameB].map((f) => {
      const filas = [...f];
      extra.forEach(([r, c, ch]) => {
        if (filas[r] && filas[r][c] === '.') filas[r] = filas[r].slice(0, c) + ch + filas[r].slice(c + 1);
      });
      return filas;
    });
  }
  Object.keys(ARCONTES).forEach((n) => { SPRITES['arconte_' + n] = figuraArconte(ARCONTES[n]); });

  // Estrellitas que caen despacio y titilan
  function estrellaCaer(lado) {
    const px = entre(1, 2), dur = aleat(14, 26), filas = SPRITES.brillo[0];
    const c = el('div', { class: `animal volador baja copo estrella ${lado}` });
    c.style.width = c.style.height = `${filas.length * px}px`;
    c.style.setProperty('--p', aleat(0.04, 0.4).toFixed(2));
    c.style.setProperty('--q', posQ(lado));
    c.style.setProperty('--onda', `${entre(6, 18)}px`);
    c.style.setProperty('--dur', `${dur.toFixed(1)}s`);
    c.style.setProperty('--retraso', `-${aleat(0, dur).toFixed(1)}s`);
    c.style.setProperty('--brillo', `${aleat(1.8, 3.4).toFixed(1)}s`);
    c.style.setProperty('--desfase', `-${aleat(0, 3).toFixed(1)}s`);
    const celda = el('div', { class: 'cuadro-fijo' });
    celda.style.width = celda.style.height = `${px}px`;
    celda.style.boxShadow = sombras(filas, px, { '#': elegir(['#ffe9a8', '#bfe6ff', '#ffd6f0']) });
    c.append(celda);
    return c;
  }

  function genshin() {
    const nombres = Object.keys(ELEMENTOS);
    // Un simbolo elemental que flota y brilla
    const orbe = (lado) => {
      const n = elegir(nombres);
      const a = volar(lado, SPRITES['el_' + n], ELEMENTOS[n], { px: [2, 3], dur: [26, 42], onda: [14, 30], aleteo: [0.5, 0.9] });
      a.style.filter = `drop-shadow(0 0 4px ${ELEMENTOS[n]['#']})`;
      return a;
    };
    // Un slime que salta en el suelo (alterna estirado y aplastado)
    const slime = (lado) => {
      const n = elegir(nombres);
      return posar(lado, SPRITES.slime, { '#': ELEMENTOS[n]['#'], w: ELEMENTOS[n].w || '#ffffff', k: '#1b2a3a' },
        { px: [3, 4], alterna: true });
    };
    // Los 7 arcontes flotan despacio, con un brillo del color de su elemento.
    // En escritorio salen los 7 (alternando lados); en el movil, 3 al azar.
    const arconte = (n, lado) => {
      const a = volar(lado, SPRITES['arconte_' + n], ARCONTES[n].col,
        { px: [3, 4], dur: [45, 70], onda: [14, 30], aleteo: [0.6, 1.0] });
      a.style.filter = `drop-shadow(0 0 5px ${ARCONTES[n].glow})`;
      return a;
    };
    const lista = Object.keys(ARCONTES).sort(() => Math.random() - 0.5).slice(0, movil ? 3 : 7);
    const arcontes = lista.map((n, i) => arconte(n, i % 2 ? 'der' : 'izq'));
    return [
      ...arcontes,
      ...lados(1).map(orbe),
      ...lados(1).map(slime),
      ...lados(movil ? 3 : 5).map(estrellaCaer),
      // Semillas de diente de leon que suben con el viento
      ...lados(movil ? 1 : 2).map((lado) => volar(lado, SPRITES.semilla, { '#': '#f2f2f8' },
        { px: [2, 3], dur: [30, 50], onda: [14, 30], aleteo: [0.8, 1.2], sube: true })),
    ];
  }

  const cont = el('div', { class: 'decoracion', 'aria-hidden': 'true' });
  document.body.append(cont);
  if (epoca === 'halloween') {
    cont.append(...halloween());
  } else if (epoca === 'navidad') {
    cont.append(...navidad());
  } else if (epoca === 'genshin') {
    cont.append(...genshin());
  } else {
    pedidos.forEach((p) => {
      const [nombre, n] = p.split(':');
      const cantidad = Number(n) || 2;
      // En el movil se usa la mitad de animales para que la pantalla no se sienta cargada
      if (FABRICAS[nombre]) cont.append(...FABRICAS[nombre](movil ? Math.max(1, Math.ceil(cantidad / 2)) : cantidad));
    });
  }
})();