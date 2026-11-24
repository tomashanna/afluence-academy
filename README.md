# Zero to Hero en Infoproductos · Nivel 1

Curso gratuito y abierto de Afluence: el **Nivel 1 (Beginner)** del programa *Zero to Hero
en Infoproductos*. En 11 módulos explica el terreno del negocio de infoproductos — tipos
de producto, oferta y copy, funnels, piezas creativas, VSL, métricas, tráfico y stack,
roles, frameworks y casos reales — con lección, vídeo, podcast y quiz en cada módulo.

> **Vista previa:** estética editorial en blanco y negro (Archivo / Archivo Expanded),
> portada con los 3 niveles del programa y el progreso del alumno; cada módulo tiene
> pestañas *Lección · Vídeo · Podcast · Quiz*. El progreso se guarda en el navegador
> (`localStorage`), sin cuentas ni servidor.
> _(Agregar aquí una captura: `docs/preview.png`.)_

## Estructura

```
index.html              Portada: niveles, módulos, casos ficticios y progreso
modulo-01…11.html       Un módulo por página (lección, vídeo, podcast, quiz)
resumen.html            Cierre del nivel: progreso + repaso en audio
diccionario.html        181 términos en 14 categorías, con buscador
assets/afluence.css     Estilos compartidos
assets/afluence.js      Motor de pestañas + quiz + progreso (cada módulo define su `Q`)
assets/diccionario.css  Estilos del diccionario
audio/NN.mp3            Podcast de cada módulo (+ intro.mp3, resumen.mp3)
video/NN.mp4            Clase en vídeo de los módulos 01–10 (el 11 está pendiente)
favicon.svg             Ícono
vercel.json             URLs limpias + cabeceras de seguridad
scripts/check-site.mjs  Verificador de enlaces/recursos locales y a11y básica (sin dependencias)
.github/                CI (validación, enlaces, gitleaks) y Dependabot
```

El `.gitignore` funciona como *allowlist*: ignora todo en la raíz salvo lo listado, para
no subir por accidente borradores, guiones o exportaciones que convivan en la carpeta.
Si agregas un archivo nuevo en la raíz, añádelo también al `.gitignore`.

## Desarrollo local

Requisitos: Python 3 (para servir) y Node.js ≥ 18 (solo para las verificaciones).

```bash
npm run serve        # = python3 -m http.server 8000 → http://localhost:8000
```

No hay build ni dependencias que instalar. Ábrelo siempre a través del servidor (no con
`file://`) para que audio, vídeo y `localStorage` se comporten como en producción.

## Verificaciones

```bash
npm run check        # html-validate (versión fijada) + enlaces/recursos locales + a11y básica
node scripts/check-site.mjs --base-url http://localhost:8000/   # además verifica por HTTP que todo responde 200
lychee --config lychee.toml './**/*.html'                       # enlaces externos (opcional, requiere lychee)
```

`scripts/check-site.mjs` revisa referencias locales (incluidos audio y vídeo) y anclas `#id`,
`rel="noopener noreferrer"` en enlaces externos, `lang`, `<title>`, `alt` en imágenes y saltos
en la jerarquía de encabezados.

En GitHub Actions (`.github/workflows/checks.yml`) corren en cada push/PR:

- **html-validate** (`.htmlvalidate.json`; solo se desactivan `no-inline-style` y `long-title`, patrones intencionales).
- **Enlaces y recursos locales**, en disco y sirviendo el sitio por HTTP.
- **lychee** para enlaces externos — informativo, no bloquea.
- **gitleaks** sobre todo el historial.

Dependabot mantiene actualizadas las GitHub Actions.

## Despliegue (Vercel)

Vercel conectado a GitHub: cada push a `main` publica solo.

1. *Add New → Project* → importar este repo.
2. **Root Directory:** raíz · **Framework Preset:** Other · Build/Output: vacíos.
3. Dominio propio: *Settings → Domains* (SSL automático).

`vercel.json` activa:

- `cleanUrls`: `/modulo-01` en vez de `/modulo-01.html` (los enlaces `.html` redirigen;
  `assets/afluence.js` reconoce ambas formas para guardar el progreso).
- Cabeceras: Content-Security-Policy, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` y `Cross-Origin-Opener-Policy`.

### Sobre la CSP

La política solo permite recursos propios más Google Fonts (CSS en `fonts.googleapis.com`,
fuentes en `fonts.gstatic.com`); no hay trackers ni scripts de terceros.

`script-src` incluye **`'unsafe-inline'`**, y es una concesión consciente: los módulos usan
manejadores `onclick="…"` (también generados dinámicamente por el quiz) y cada página define
sus datos en un `<script>` inline. Los hashes no sirven para atributos de evento dinámicos.
Para quitarlo: mover los `onclick` a `addEventListener` con delegación en `afluence.js` y los
`<script>` inline a archivos `.js`; después cambiar a `script-src 'self'`.

Si el módulo 11 recibe un vídeo embebido de YouTube/Vimeo, hay que agregar a la CSP
`frame-src https://www.youtube-nocookie.com https://player.vimeo.com` (o el proveedor que se use).

## Estrategia de medios (audio y vídeo)

Hoy los medios viven en el repo y los sirve Vercel como archivos estáticos:
13 MP3 (~126 MB) y 10 MP4 (~334 MB, ~27–45 MB cada uno). Todos los `<audio>`/`<video>`
usan `preload="metadata"`, así que solo se descarga el archivo completo cuando el alumno
pulsa *play*.

**No se usa Git LFS**: Vercel no descarga los objetos LFS por defecto y el sitio quedaría
con punteros en vez de archivos. Ten en cuenta también que el historial ya contiene los
medios (~485 MB): sacarlos ahora no achica el repo sin reescribir la historia.

| Opción | Pros | Contras |
| --- | --- | --- |
| **1. Actual: medios en el repo + Vercel** | Cero configuración, todo versionado junto | Repo pesado; cada reproducción consume la transferencia del plan de Vercel; sin streaming adaptativo |
| **2. Vídeo en plataforma de streaming** (YouTube no listado, Vimeo, Cloudflare Stream, Bunny Stream, Mux) | Streaming adaptativo (HLS), mejor en móviles y redes lentas, no consume la transferencia de Vercel | Embed por `<iframe>` (ajustar CSP `frame-src`); algunas opciones son de pago |
| **3. Almacenamiento de objetos + CDN** (Cloudflare R2, Bunny Storage, S3 + CloudFront) | Se mantiene el `<video>`/`<audio>` nativo con URL absoluta; R2 no cobra egreso | Una cuenta más; ajustar CSP `media-src`; los archivos ya no se versionan con el sitio |

**Recomendación:** mantener la opción 1 mientras el tráfico sea bajo y vigilar el uso de
transferencia en el panel de Vercel (revisa los límites vigentes del plan en
https://vercel.com/docs/limits). Cuando crezca, pasar **el vídeo** a la opción 2 (al ser
contenido gratuito, YouTube no listado o `youtube-nocookie` es lo más simple; Cloudflare
Stream o Bunny Stream si se quiere un reproductor sin marca) y **el audio** a la opción 3.
Los nuevos medios deberían subirse directamente allí para no seguir engordando el historial.

## Licencia

- **Código** (HTML, CSS, JavaScript, scripts y configuración): [MIT](LICENSE).
- **Contenido** (lecciones, quizzes, diccionario, audios y vídeos):
  [CC BY-NC-SA 4.0](LICENSE-CONTENT.md) — puedes compartirlo y adaptarlo con atribución,
  sin fines comerciales y bajo la misma licencia.

## Créditos

- Contenido y diseño: Tomás Hanna / Afluence.
- Los creadores y agencias de los casos de estudio (Sofía, Marco, Renata, Diego, Lanza) son ficticios.
- Tipografías Archivo y Archivo Expanded vía [Google Fonts](https://fonts.google.com/) (SIL Open Font License).
