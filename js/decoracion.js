// Decoracion con animales de pixeles + decoracion por epoca (la activa el administrador).
//   <body data-decoracion="mariposas:2,luciernagas:3">   -> animales de cada vista (numero = cantidad POR LADO)
// Animales: aves, mariposas, gatos, buhos, luciernagas.  Epocas: halloween.
(async function () {
  const pedidos = (document.body.dataset.decoracion || '').split(',').map((s) => s.trim()).filter(Boolean);

  // ---------- Epoca activa ----------
  const CLASES_EPOCA = { halloween: 'epoca-halloween', navidad: 'epoca-navidad', genshin: 'epoca-genshin', demonslayer: 'epoca-demonslayer' };

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
  // 'extra' solo rellena pixeles vacios; 'reemplaza' pinta encima de pixeles ya dibujados (cuerpo, cara...)
  function figuraArconte({ tope, extra, reemplaza = [] }) {
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
      reemplaza.forEach(([r, c, ch]) => {
        if (filas[r] && filas[r][c] && filas[r][c] !== '.') filas[r] = filas[r].slice(0, c) + ch + filas[r].slice(c + 1);
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

  // ---------- Demon Slayer: los 9 pilares y las lunas superiores (dibujos propios inspirados en cada uno) ----------
  // Figuras de 11x16 pixeles. Letras de la base: h=pelo, s=piel, k=ojos, c=ropa/haori, a=detalle central,
  // b=cinturon, p=pantalon, f=zapatos. Cada personaje cambia filas enteras ('filas'), pinta pixeles sueltos
  // ('pix', siempre) o pinta encima de lo ya dibujado ('sobre', solo donde hay algo).
  const BASE_DS_A = [
    '...hhhhh...', '..hhhhhhh..', '.hhhhhhhhh.', '.hhssssshh.', '.hsksssksh.', '.hsssssssh.', '...sssss...',
    '..ccccccc..', '.scccacccs.', '.scccacccs.', '..cccaccc..', '..bbbbbbb..', '..ppppppp..',
    '..pp...pp..', '..pp...pp..', '..ff...ff..',
  ];
  const BASE_DS_B = [
    ...BASE_DS_A.slice(0, 8), '..cccaccc..', '.scccacccs.', '.scccacccs.', '..bbbbbbb..', '..ppppppp..',
    '...pp.pp...', '...pp.pp...', '...ff.ff...',
  ];
  const DS = { s: '#f2d2b0', b: '#2a2a38', p: '#26262e', f: '#1a1a22' };
  const rect = (r0, r1, c0, c1, ch) => {
    const l = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) l.push([r, c, ch]);
    return l;
  };
  const damero = (r0, r1, c0, c1, a, b) => {
    const l = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) l.push([r, c, (r + c) % 2 ? a : b]);
    return l;
  };
  const HAORI = { 12: '.ccccccccc.' };   // el haori llega hasta las rodillas
  const HOMBROS = { 7: 'sscccccccss', 8: ['sscccacccss', '..cccaccc..'], 9: 'sscccacccss', 10: ['..cccaccc..', 'sscccacccss'] };   // cuerpo ancho

  function figuraDS({ filas = {}, pix = [], sobre = [] }) {
    return [BASE_DS_A, BASE_DS_B].map((base, i) => {
      const f = base.map((fila, r) => {
        const o = filas[r];
        return o === undefined ? fila : (Array.isArray(o) ? o[i] : o);
      });
      sobre.forEach(([r, c, ch]) => { if (f[r][c] !== '.') f[r] = f[r].slice(0, c) + ch + f[r].slice(c + 1); });
      pix.forEach(([r, c, ch]) => { f[r] = f[r].slice(0, c) + ch + f[r].slice(c + 1); });
      return f;
    });
  }

  const PILARES = {
    giyu: {   // Agua: haori mitad liso, mitad estampado de caparazon
      filas: { ...HAORI },
      sobre: [...damero(7, 10, 6, 8, 'g', 'r'), ...damero(12, 12, 6, 9, 'g', 'r')],
      pix: [[5, 0, 'h'], [6, 0, 'h'], [5, 10, 'h'], [6, 10, 'h']],
      col: { h: '#1c2030', k: '#2a5aa0', c: '#1f5a4a', a: '#1f5a4a', g: '#d8c050', r: '#c8502a', p: '#1c1c26' } },
    shinobu: {   // Insecto: pelo corto con puntas moradas, mariposa y haori blanco con alas
      filas: { ...HAORI, 6: '..hsssssh..' },
      sobre: damero(12, 12, 1, 9, 'g', 'q'),
      pix: [[6, 2, 'q'], [6, 8, 'q'], [1, 8, 'm'], [1, 10, 'm'], [2, 9, 'm'], [3, 8, 'm'], [3, 10, 'm']],
      col: { h: '#2a1c40', k: '#b070e0', c: '#f4f2f6', a: '#24222e', g: '#7fd0a0', q: '#a060d0', m: '#e070e0', s: '#f6dccb' } },
    rengoku: {   // Llamas: melena de fuego, cejas bifurcadas y haori blanco con llamas
      filas: { ...HAORI, 0: '.r..hhh..r.', 1: '.rhhhhhhhr.' },
      sobre: damero(12, 12, 1, 9, 'r', 'y'),
      pix: [[3, 0, 'r'], [3, 10, 'r'], [3, 3, 'r'], [3, 7, 'r'], [4, 0, 'h'], [4, 10, 'h']],
      col: { h: '#f4c040', r: '#e0502a', y: '#f4c040', k: '#f09020', c: '#f4f0e8', a: '#2a2a30', b: '#8a5a2a', s: '#f0cfa8' } },
    tengen: {   // Sonido: corpulento, diadema con joyas y pintura facial
      filas: { ...HOMBROS, 2: '.hgrgugrgh.' },
      pix: [[5, 3, 'r'], [5, 7, 'r']],
      col: { h: '#f4f4f8', k: '#c2284a', g: '#e8c34a', r: '#c2284a', u: '#4aa0ff', c: '#22222e', a: '#e8c34a', b: '#e8c34a', s: '#e8c098', p: '#2a2a38' } },
    mitsuri: {   // Amor: trenzas rosadas con puntas verdes y falda
      filas: { 12: '..aaaaaaa..' },
      pix: [...rect(5, 10, 0, 0, 'h'), ...rect(11, 12, 0, 0, 'g'), ...rect(5, 10, 10, 10, 'h'), ...rect(11, 12, 10, 10, 'g'), [5, 3, 'x']],
      col: { h: '#f090b8', g: '#7fd45a', k: '#7fd45a', c: '#f4eef0', a: '#f090b8', x: '#6a3a4a', p: '#f4f0f4', f: '#4a3a4a', s: '#f6dccb' } },
    muichiro: {   // Niebla: pelo larguisimo que se aclara a menta y haori blanco
      filas: { ...HAORI },
      sobre: damero(12, 12, 1, 9, 'g', 'c'),
      pix: [...rect(4, 9, 0, 0, 'h'), ...rect(10, 13, 0, 0, 'g'), ...rect(4, 9, 10, 10, 'h'), ...rect(10, 13, 10, 10, 'g'),
        [3, 3, 'h'], [3, 4, 'h'], [3, 6, 'h'], [3, 7, 'h']],
      col: { h: '#2a2f44', g: '#a8e6d0', k: '#a8e6d0', c: '#eef2f4', a: '#7fd0b8', s: '#f2d6c4' } },
    sanemi: {   // Viento: pelo blanco de punta, cicatrices, pecho abierto
      filas: { ...HAORI, 0: 'h.h.h.h.h.h', 1: 'hhhhhhhhhhh' },
      sobre: rect(7, 9, 4, 6, 's'),
      pix: [[3, 0, 'h'], [3, 10, 'h'], [3, 3, 'd'], [3, 7, 'd'], [4, 2, 'r'], [5, 3, 'r'], [4, 8, 'r'], [5, 7, 'r'], [8, 5, 'r'], [9, 4, 'r']],
      col: { h: '#f4f4f8', k: '#9a60d0', c: '#ecece8', a: '#2a2a30', r: '#c05050', d: '#2a1a2a', s: '#f0cfa8' } },
    gyomei: {   // Roca: gigante calvo, ojos blancos, lagrimas y rosario
      px: [4, 4],
      filas: { ...HOMBROS, ...HAORI },
      pix: [[5, 3, 'l'], [5, 7, 'l'], [6, 3, 'l'], [6, 7, 'l'], ...rect(7, 7, 3, 7, 'o'), [8, 5, 'o'], [9, 5, 'o'], [10, 5, 'o']],
      col: { h: '#c8a078', s: '#c8a078', k: '#eaeaf4', c: '#3a3a4a', a: '#d8c8a0', b: '#d8c8a0', l: '#8fd0ff', o: '#7a4a2a' } },
    obanai: {   // Serpiente: venda en la boca, ojos distintos, serpiente blanca y haori rayado
      filas: { ...HAORI },
      sobre: [...rect(8, 8, 2, 8, 'a'), ...rect(10, 10, 2, 8, 'a'), ...rect(12, 12, 1, 9, 'a')],
      pix: [...rect(5, 5, 2, 8, 'w'), ...rect(6, 6, 3, 7, 'w'), [4, 7, 'y'], [3, 3, 'h'], [3, 4, 'h'], [6, 1, 'h'],
        [5, 10, 'n'], [6, 9, 'n'], [6, 10, 'n'], [7, 10, 'n'], [8, 10, 'n'], [9, 10, 'n'], [10, 10, 'n'], [10, 9, 'n']],
      col: { h: '#16161e', k: '#4a8ae0', y: '#e0d040', c: '#e8e4d4', a: '#16161e', w: '#f0f0f0', n: '#dfe8f0' } },
  };

  // Lunas superiores. 'glow' = aura con la que flotan. Gyokko lleva dibujo propio (cabeza de pez sobre su vasija).
  const LUNAS = {
    kokushibo: {   // Luna 1: seis ojos rojos, pelo larguisimo y espada
      glow: '#c23a4a',
      pix: [...rect(4, 8, 0, 0, 'h'), ...rect(4, 8, 10, 10, 'h'), [3, 3, 'k'], [3, 7, 'k'], [5, 3, 'k'], [5, 7, 'k'],
        [9, 10, 'g'], ...rect(10, 15, 10, 10, 'q')],
      col: { h: '#1e1a2a', s: '#d8c8d8', k: '#ff3a3a', c: '#3a2858', a: '#8a5ac8', b: '#8a5ac8', p: '#241a34', g: '#e8c34a', q: '#cfc8e0' } },
    doma: {   // Luna 2: pelo rubio con puntas rojizas, ojos irisados, sonrisa y abanicos dorados
      glow: '#7fd0e0',
      filas: { ...HAORI },
      sobre: damero(12, 12, 1, 9, 'a', 'c'),
      pix: [...rect(8, 10, 0, 0, 'g'), ...rect(8, 10, 10, 10, 'g'), [3, 0, 'r'], [3, 10, 'r'], [2, 1, 'r'], [2, 9, 'r'], [4, 7, 'j'],
        [5, 3, 'm'], [6, 4, 'm'], [6, 5, 'm'], [6, 6, 'm'], [5, 7, 'm']],
      col: { h: '#f2e8c8', s: '#f6e8e0', k: '#8fe8ee', j: '#f0a0e8', c: '#f4f0f8', a: '#6ad0e0', g: '#e8c34a', r: '#c86a50', m: '#d07080', b: '#e8c34a', p: '#e8e4f0' } },
    akaza: {   // Luna 3: pelo rosa de punta, tatuajes azules, torso desnudo y pantalon blanco
      glow: '#4a8ae0',
      filas: { 0: '..h.h.h.h..' },
      sobre: [[7, 3, 'a'], [7, 7, 'a'], [9, 1, 'a'], [9, 9, 'a']],
      col: { h: '#f090b8', k: '#ffd24a', s: '#f0cfb8', c: '#f0cfb8', a: '#4a8ae0', b: '#2a2a3a', p: '#ecece8', f: '#f0cfb8' } },
    hantengu: {   // Luna 4: viejito calvo con cuernos, llorando y asustado
      glow: '#a07ad0', px: [2, 3],
      filas: { 0: '...n...n...', 1: '..sssssss..', 2: '.sssssssss.', 3: '.hsssssssh.', 5: '.hssmmmssh.' },
      pix: [[5, 3, 'l'], [5, 7, 'l'], [6, 3, 'l'], [6, 7, 'l']],
      col: { h: '#e8e8e8', n: '#f0e8c0', s: '#cdc4b8', k: '#1a1a1a', m: '#3a1a2a', l: '#6ab0ff', c: '#5a4a7a', a: '#8a7aaa' } },
    gyokko: {   // Luna 5: cabeza de pez con ojos saltones, labios gruesos, dentro de su vasija
      glow: '#4aa890',
      col: { f: '#4aa890', y: '#ffd24a', k: '#1a1a2a', m: '#e86a8a', g: '#e8c34a', '#': '#2f4a8a', c: '#5a86d0', w: '#c8dcf8' },
      sprite: [
        ['..f.f.f.f..', '.fffffffff.', '.fffffffff.', 'fyyyfffyyyf', 'fykyfffykyf', '.fffmmmfff.', '..fffmfff..',
          '.ggggggggg.', '#ccccccccc#', '#cwcwcwcwc#', '#ccccccccc#', '#cwcwcwcwc#', '.#ccccccc#.', '..#######..'],
        ['.f.f.f.f.f.', '.fffffffff.', '.fffffffff.', 'fffffffffff', 'fyyyfffyyyf', '.ffmmmmmff.', '..fffmfff..',
          '.ggggggggg.', '#ccccccccc#', '#cwcwcwcwc#', '#ccccccccc#', '#cwcwcwcwc#', '.#ccccccc#.', '..#######..'],
      ] },
    daki: {   // Luna 6: pelo plateado larguisimo, kimono rojo, obi dorado y cintas flotantes
      glow: '#e83a6a',
      filas: { ...HAORI },
      sobre: [[7, 2, 's'], [7, 8, 's'], [10, 3, 'w'], [10, 7, 'w']],
      pix: [...rect(4, 10, 0, 0, 'h'), ...rect(4, 10, 10, 10, 'h'), [11, 0, 'r'], [12, 0, 'r'], [13, 0, 'r'], [13, 1, 'r'],
        [11, 10, 'r'], [12, 10, 'r'], [13, 10, 'r'], [13, 9, 'r'], [0, 7, 'm']],
      col: { h: '#f0ecf8', k: '#ff3a5a', s: '#f6e6e0', c: '#c83a6a', a: '#ffd24a', b: '#e8c34a', r: '#ff6a9a', m: '#ff6a9a', w: '#fff0f4' } },
  };
  Object.keys(PILARES).forEach((n) => { SPRITES['pilar_' + n] = figuraDS(PILARES[n]); });
  Object.keys(LUNAS).forEach((n) => { SPRITES['luna_' + n] = LUNAS[n].sprite || figuraDS(LUNAS[n]); });
  const colDS = (d) => ({ ...DS, ...d.col });

  // Petalos de glicina que caen mecidos por el viento
  function petalo(lado) {
    const px = entre(1, 2), dur = aleat(12, 24);
    const filas = SPRITES.copo[0];
    const c = el('div', { class: `animal volador baja copo petalo ${lado}` });
    c.style.width = c.style.height = `${filas.length * px}px`;
    c.style.setProperty('--p', aleat(0.04, 0.4).toFixed(2));
    c.style.setProperty('--q', posQ(lado));
    c.style.setProperty('--onda', `${entre(10, 28)}px`);
    c.style.setProperty('--dur', `${dur.toFixed(1)}s`);
    c.style.setProperty('--retraso', `-${aleat(0, dur).toFixed(1)}s`);
    const celda = el('div', { class: 'cuadro-fijo' });
    celda.style.width = celda.style.height = `${px}px`;
    celda.style.boxShadow = sombras(filas, px, { '#': elegir(['#b79ae0', '#9a7ad0', '#d0b8f0']) });
    c.append(celda);
    return c;
  }

  function demonslayer() {
    // Cuantos salen de cada grupo (en escritorio todos; en el movil menos para no cargar la pantalla)
    const N_PILARES = movil ? 3 : Object.keys(PILARES).length;
    const N_LUNAS = movil ? 2 : Object.keys(LUNAS).length;
    const mezclar = (obj, n) => Object.keys(obj).sort(() => Math.random() - 0.5).slice(0, n);
    // Los pilares recorren el margen caminando
    const pilares = mezclar(PILARES, N_PILARES).map((n, i) =>
      pasear(i % 2 ? 'der' : 'izq', SPRITES['pilar_' + n], colDS(PILARES[n]), { px: PILARES[n].px || [3, 4], dur: [32, 52] }));
    // Las lunas flotan lentamente con un aura del color de cada una
    const lunas = mezclar(LUNAS, N_LUNAS).map((n, i) => {
      const a = volar(i % 2 ? 'izq' : 'der', SPRITES['luna_' + n], colDS(LUNAS[n]),
        { px: LUNAS[n].px || [3, 4], dur: [50, 80], onda: [14, 30], aleteo: [0.7, 1.1] });
      a.style.filter = `drop-shadow(0 0 5px ${LUNAS[n].glow})`;
      return a;
    });
    return [
      ...lunas,
      ...pilares,
      ...lados(movil ? 3 : 5).map(petalo),
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
  } else if (epoca === 'demonslayer') {
    cont.append(...demonslayer());
  } else {
    pedidos.forEach((p) => {
      const [nombre, n] = p.split(':');
      const cantidad = Number(n) || 2;
      // En el movil se usa la mitad de animales para que la pantalla no se sienta cargada
      if (FABRICAS[nombre]) cont.append(...FABRICAS[nombre](movil ? Math.max(1, Math.ceil(cantidad / 2)) : cantidad));
    });
  }
})();