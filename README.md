# Fugazzesions — portfolio

Sitio de una sola página (sin nav) para mostrar el proyecto Fugazzesions:
mapa 3D interactivo por edición, fotos, y marcas que apoyan el proyecto.

## Correr en local

```bash
npm install
npm run dev
```

Abre la URL que te muestra la terminal (por defecto `http://localhost:5173`).

## Build para producción

```bash
npm run build
```

Genera todo en `dist/` — subís esa carpeta a donde despliegues (Vercel,
Netlify, etc. — el mismo flujo que usás para tus otros proyectos Vite).

## Estructura

```
index.html          — estructura de la página (hero, mapa, fotos, marcas)
src/
  style.css          — todos los estilos
  site-data.json      — TODO el texto del sitio (ver abajo)
  main.js             — textos, fotos, marcas (no depende de three.js)
  map.js               — el mapa 3D (three.js) — módulo aparte a propósito
public/
  assets/
    logos/             — logo Fugazzesions + logos de marcas
    photos/edition2/    — fotos reales de la Fugazzesions #2
    model-ed3.glb        — modelo 3D del galpón, Fugazzesions #3
```

## Editar contenido (textos, marcas)

Todo el texto del sitio (hero, "el proyecto", stats, marcas y sus tiers)
vive en **`src/site-data.json`**. Editalo directo ahí y guardá — con
`npm run dev` corriendo, el navegador recarga solo.

## Agregar ediciones (#1, #2, #4...)

- **Fotos**: poné los archivos en `public/assets/photos/edition<N>/` y
  agregá las rutas en el array `PHOTOS` de `src/main.js` (mismo patrón
  que la edición 2).
- **Modelo 3D**: poné el `.glb` en `public/assets/` y referencialo en el
  array `EDITIONS` de `src/map.js` (campo `model`). Los nodos del
  modelo tienen que llamarse igual que las keys de `HOTSPOTS` en
  `src/main.js` (`entrada`, `pistaprincipal`, `pistaclases`,
  `sectorchill`, `sectorDJ`, `banos`, `fumadores`, `Barracomida`)
  para que los puntos clickeables funcionen.
- Si un modelo pesa mucho, conviene optimizarlo antes con
  [`gltf-transform`](https://gltf-transform.dev/) (`dedup` → `prune` →
  `resize` → `webp`) — así se hizo con el de la #3 (bajó de ~10MB a
  ~2.4MB sin perder calidad visible).

## Marcas / sponsors

Están en `src/site-data.json` → `brands.main` (Plano, Majorani, Sauzal)
y `brands.featured` (el resto). Cada una es `{ "name": "...", "logo": "clave" }`
— la clave tiene que existir en `ASSETS.brandLogos` dentro de `src/main.js`,
apuntando a un archivo en `public/assets/logos/`.
