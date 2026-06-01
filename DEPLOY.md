# Deploy — Zero to Hero Nivel 1 (sitio estático)

El sitio está en `/sitio/` (28 archivos, ~125 MB). Es 100% estático: no necesita servidor ni base de datos.

## Opción recomendada: Netlify (gratis)

### 1. Subir el sitio
1. Crea una cuenta gratis en https://app.netlify.com (con email o Google).
2. Ve a https://app.netlify.com/drop
3. Arrastra la **carpeta `sitio`** (no el .zip) a la zona de "drag and drop".
4. En ~30 seg tendrás el sitio online en una URL tipo `https://nombre-random.netlify.app`. ✅
5. (Opcional) Renombra el sitio en *Site configuration → Change site name*.

### 2. Conectar tu dominio propio
1. En el sitio: *Domain management → Add a domain* → escribe tu dominio (ej. `tudominio.com`).
2. Netlify te dará UNA de estas dos rutas:
   - **Opción A (más fácil): usar Netlify DNS.** Te da unos *nameservers* (ej. `dns1.p01.nsone.net`). Entra al panel de tu registrador (donde compraste el dominio) y reemplaza los nameservers por los de Netlify. Listo.
   - **Opción B: mantener tu DNS actual.** Agregas en tu registrador:
     - un registro `CNAME` para `www` → `nombre-sitio.netlify.app`
     - el dominio raíz (apex) → con un registro `A`/`ALIAS` que Netlify te indica.
3. **SSL (candado https):** Netlify lo activa solo (Let's Encrypt) en unos minutos. No pagas nada.
4. La propagación del DNS tarda de minutos a unas horas.

### 3. Actualizar el sitio más adelante (ej. cuando agregues los videos)
- Vuelve a https://app.netlify.com/drop y arrastra la carpeta `sitio` otra vez (reemplaza todo).
- O conecta un repo de GitHub para que se actualice solo al hacer push.

## Alternativa: Cloudflare Pages (gratis, ancho de banda ilimitado)
Mejor si el tráfico de audio crece mucho.
1. Cuenta en https://dash.cloudflare.com → *Workers & Pages → Create → Pages → Upload assets*.
2. Sube la carpeta `sitio` (o el .zip).
3. Dominio: *Custom domains → Set up a domain*. Si el dominio ya está en Cloudflare DNS, es 1 clic.

## Notas
- Sube el **contenido de `/sitio/`** (que `index.html` quede en la raíz del sitio).
- NO subas la carpeta `.build/` ni el `.zip` (quedan fuera de `/sitio/`).
- Los videos: hoy son placeholders. Cuando los tengas (YouTube/Vimeo), se pegan los `<iframe>` y se re-sube.
