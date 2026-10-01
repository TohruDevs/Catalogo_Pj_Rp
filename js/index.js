let modoRegistro = false;
montarNav();
new URLSearchParams(location.search).has('login') && !getToken() ? mostrarLogin() : mostrarGrupos();

function mostrarLogin() { $('vista-grupos').hidden = true; $('vista-login').hidden = false; }

$('cambiar-modo').onclick = () => {
  modoRegistro = !modoRegistro;
  $('campo-nombre').hidden = !modoRegistro;
  $('l-nombre').required = modoRegistro;
  $('login-titulo').textContent = modoRegistro ? 'Crear cuenta' : 'Iniciar sesión';
  $('login-btn').textContent = modoRegistro ? 'REGISTRARME' : 'ENTRAR';
  $('cambiar-modo').textContent = modoRegistro ? 'Ya tengo cuenta' : '¿No tienes cuenta? Regístrate';
};

$('form-login').onsubmit = async (e) => {
  e.preventDefault();
  $('login-error').textContent = '';
  const correo = $('l-correo').value, contrasena = $('l-pass').value;
  try {
    if (modoRegistro) await api('/auth/registro', { method: 'POST', body: { nombre: $('l-nombre').value, correo, contrasena } });
    const r = await api('/auth/login', { method: 'POST', body: { correo, contrasena } });
    guardarSesion(r.token, r.usuario);
    montarNav();
    history.replaceState(null, '', 'index.html');
    mostrarGrupos();
  } catch (err) { $('login-error').textContent = err.message; }
};

async function mostrarGrupos() {
  $('vista-login').hidden = true;
  $('vista-grupos').hidden = false;
  $('btn-nuevo-grupo').hidden = !(getUsuario() || {}).es_administrador;
  try {
    const grupos = await api('/grupos');
    $('msg').textContent = grupos.length ? '' : 'Aún no hay grupos.';
    $('grupos').replaceChildren(...grupos.map((g) =>
      el('a', { class: 'card', href: 'grupo.html?id=' + g.id },
        el('div', { class: 'info' }, el('h3', {}, g.nombre), el('p', {}, g.descripcion || '')),
        el('div', { class: 'pie' }, 'entrar'))));
  } catch (err) { $('msg').textContent = err.message; }
}

$('btn-nuevo-grupo').onclick = () => { $('grupo-error').textContent = ''; $('dlg-grupo').showModal(); };
$('form-grupo').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await api('/grupos', { method: 'POST', body: { nombre: $('g-nombre').value, descripcion: $('g-desc').value } });
    $('form-grupo').reset();
    $('dlg-grupo').close();
    mostrarGrupos();
  } catch (err) { $('grupo-error').textContent = err.message; }
};