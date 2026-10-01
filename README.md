# Frontend - Directorio de personajes

HTML, CSS y JS puro (sin build). Se conecta al backend por `js/config.js`.

## Uso
1. Enciende el backend (por defecto en http://localhost:3000).
2. Sirve esta carpeta con cualquier servidor estatico, por ejemplo:
   - VS Code: extension "Live Server" (clic derecho en index.html > Open with Live Server)
   - o en la terminal: `npx serve .`
3. Si el backend usa otra direccion, edita `API_URL` en `js/config.js`.

El backend debe tener CORS activado (el del proyecto ya lo tiene).
