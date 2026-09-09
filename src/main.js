/* ============================================================
   Este primer módulo (main.js) NO importa three.js a propósito:
   contenido, fotos y marcas deben renderizarse aunque el mapa 3D
   (map.js, que sí depende de three.js) falle al inicializar.
   Un import estático que falla frena TODO ese módulo — separarlo en
   dos scripts evita que un problema con el mapa deje vacío el resto
   de la página.
   ============================================================ */
import siteDataJson from './site-data.json';

/* ============================================================
   CONTENIDO — assets fijos (no editables desde el sitio)
   ============================================================ */

const ASSETS = {
  logoWordmark: '/assets/logos/wordmark.png',
  logoMascot: '/assets/logos/mascot.png',
  brandLogos: {
    plano: '/assets/logos/plano.webp',
    m_monogram: '/assets/logos/m_monogram.webp',
    sauzal: '/assets/logos/sauzal.webp',
    adrenaline: '/assets/logos/adrenaline.webp',
    samana: '/assets/logos/samana.webp',
    allu: '/assets/logos/allu.webp',
    diamond: '/assets/logos/diamond.webp',
    hbk: '/assets/logos/hbk.webp',
    junglaquad: '/assets/logos/junglaquad.webp',
    leu: '/assets/logos/leu.webp',
    oneplace: '/assets/logos/oneplace.webp',
    qadabra: '/assets/logos/qadabra.webp',
    quadskool: '/assets/logos/quadskool.webp',
    teuton: '/assets/logos/teuton.webp',
    itawax: '/assets/logos/itawax.webp',
  },
};

const EDITIONS = [
  { id: 1, label: '#1', model: null },
  { id: 2, label: '#2', model: null },
  { id: 3, label: '#3', model: '/assets/model-ed3.glb' },
  { id: 4, label: '#4', model: null, tagKey: 'edition4.badge' },
];

// zonas clickeables: deben coincidir con el nombre del nodo en el .glb
const HOTSPOTS = {
  entrada:          { title: 'Entrada',          desc: 'Por acá se arranca el recorrido — acceso principal al galpón.' },
  pistaprincipal:   { title: 'Pista principal',  desc: 'El corazón del evento: los spots centrales, construidos desde cero para esta edición.' },
  pistaclases:      { title: 'Pista de clases',  desc: 'Espacio de clases abiertas, para quienes se están iniciando en el patín.' },
  sectorchill:       { title: 'Sector chill',     desc: 'Para bajar un cambio entre tanda y tanda.' },
  sectorDJ:          { title: 'Sector DJ',        desc: 'De acá sale la música del cierre — el plus de la fiesta, después de un día de patín.' },
  banos:             { title: 'Baños',            desc: 'Servicios del predio.' },
  fumadores:         { title: 'Zona fumadores',   desc: 'Sector habilitado para fumadores.' },
  Barracomida:       { title: 'Barra de comida',  desc: 'Pizza y bebidas para seguir con energía — parte de "pizza, patín y punto".' },
};

// fotos reales por edición (null = todavía no cargadas -> mosaico placeholder)
const PHOTOS = [
  { edition: 1, real: null, placeholderCount: 6 },
  { edition: 2, real: [
      '/assets/photos/edition2/p01.jpg','/assets/photos/edition2/p02.jpg','/assets/photos/edition2/p03.jpg','/assets/photos/edition2/p04.jpg',
      '/assets/photos/edition2/p05.jpg','/assets/photos/edition2/p06.jpg','/assets/photos/edition2/p07.jpg','/assets/photos/edition2/p08.jpg',
      '/assets/photos/edition2/p09.jpg','/assets/photos/edition2/p10.jpg','/assets/photos/edition2/p11.jpg','/assets/photos/edition2/p12.jpg',
      '/assets/photos/edition2/p13.jpg','/assets/photos/edition2/p14.jpg','/assets/photos/edition2/p15.jpg','/assets/photos/edition2/p16.jpg'
    ] },
  { edition: 3, real: null, placeholderCount: 8 },
];

/* ============================================================
   SITE_DATA — contenido editable, vive en ./site-data.json
   ============================================================ */
const SITE_DATA = JSON.parse(JSON.stringify(siteDataJson)); // copia editable

function getPath(obj, path){
  return path.split('.').reduce((o,k) => (o == null ? o : o[k]), obj);
}

function renderTextFields(){
  document.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    const val = getPath(SITE_DATA, path);
    if (val != null) el.textContent = val;
  });
  document.getElementById('hero-next-badge').textContent = SITE_DATA.edition4.badge;
  document.getElementById('map-soon-text').textContent = SITE_DATA.edition4.soonText;
}
renderTextFields();

/* ============================================================
   FOTOS
   ============================================================ */
(function buildPhotos(){
  const root = document.getElementById('photo-blocks');
  root.innerHTML = '';
  PHOTOS.forEach(ed => {
    const block = document.createElement('div');
    block.className = 'ed-photo-block';

    const head = document.createElement('div');
    head.className = 'ed-photo-head';
    head.innerHTML = `<h3>Fugazzesions #${ed.edition}</h3><span class="credit">foto: Tania Levy</span>`;
    block.appendChild(head);

    const mosaic = document.createElement('div');
    mosaic.className = 'mosaic';

    if (ed.real && ed.real.length){
      ed.real.forEach((src, i) => {
        const item = document.createElement('div');
        item.className = 'mosaic-item';
        const img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        img.alt = `Fugazzesions #${ed.edition} — foto ${i + 1}`;
        item.appendChild(img);
        mosaic.appendChild(item);
      });
    } else {
      for (let i = 0; i < (ed.placeholderCount || 6); i++){
        const item = document.createElement('div');
        item.className = 'mosaic-item';
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.innerHTML = `Fugazzesions #${ed.edition}<br><span>foto pendiente</span>`;
        item.appendChild(tile);
        mosaic.appendChild(item);
      }
    }
    block.appendChild(mosaic);
    root.appendChild(block);
  });
})();

/* ============================================================
   MARCAS
   ============================================================ */
function buildBrands(){
  const fillTier = (id, tierKey) => {
    const el = document.getElementById(id);
    el.innerHTML = '';
    SITE_DATA.brands[tierKey].forEach((brand, i) => {
      const isObj = brand && typeof brand === 'object';
      const name = isObj ? brand.name : brand;
      const logoKey = isObj ? brand.logo : null;
      const logoSrc = logoKey && ASSETS.brandLogos && ASSETS.brandLogos[logoKey];
      const tile = document.createElement('div');
      tile.className = 'brand-tile' + (logoSrc ? ' has-logo' : '');
      if (logoSrc){
        const img = document.createElement('img');
        img.className = 'logo-img';
        img.src = logoSrc;
        img.alt = name;
        tile.appendChild(img);
      } else {
        const dot = document.createElement('span');
        dot.className = 'dot';
        tile.appendChild(dot);
      }
      const nameEl = document.createElement('span');
      nameEl.className = 'name';
      nameEl.textContent = name;
      tile.appendChild(nameEl);
      el.appendChild(tile);
    });
  };
  fillTier('brands-main', 'main');
}
buildBrands();

/* En desktop la fila se ve entera (el CSS de arriba de 640px ignora la
   clase .active) — esto solo importa en mobile, donde los tiles quedan
   apilados y se van turnando cada 1s. Se deja corriendo siempre para no
   depender de matchMedia ni de escuchar resize. */
(function setupSponsorsCarousel(){
  const row = document.getElementById('brands-main');
  const tiles = Array.from(row.querySelectorAll('.brand-tile'));
  if (tiles.length < 2) return;

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'sponsors-dots';
  tiles.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ver marca ${i + 1} de ${tiles.length}`);
    dotsWrap.appendChild(dot);
  });
  row.insertAdjacentElement('afterend', dotsWrap);
  const dots = Array.from(dotsWrap.children);

  let idx = 0;
  tiles[0].classList.add('active');
  dots[0].classList.add('active');

  const show = (next) => {
    tiles[idx].classList.remove('active');
    dots[idx].classList.remove('active');
    idx = next;
    tiles[idx].classList.add('active');
    dots[idx].classList.add('active');
  };

  let timer = setInterval(() => show((idx + 1) % tiles.length), 2000);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i === idx) return;
      clearInterval(timer);
      show(i);
      timer = setInterval(() => show((idx + 1) % tiles.length), 2000);
    });
  });
})();

/* ============================================================
   LOGOS
   ============================================================ */
document.querySelectorAll('img[src="/assets/logos/wordmark.png"]').forEach(img => img.src = ASSETS.logoWordmark);
document.querySelectorAll('img[src="/assets/logos/mascot.png"]').forEach(img => img.src = ASSETS.logoMascot);

// Exponemos lo que necesita el script del mapa 3D (módulo aparte, ver arriba)
window.__FUGA = { SITE_DATA, ASSETS, EDITIONS, HOTSPOTS, getPath };

// Si el módulo del mapa 3D no llegó a arrancar (falló el import externo a
// three.js: red, CDN caído, bloqueador) mostramos un aviso en vez de dejar
// el spinner girando para siempre — el resto del sitio ya se ve igual.
setTimeout(() => {
  if (window.__FUGA_MAP_SCRIPT_LOADED) return;
  const loadingEl = document.getElementById('map-loading');
  if (!loadingEl) return;
  loadingEl.innerHTML = `
    <p style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--ink-soft);text-align:center;max-width:300px;margin:0 auto;">
      No pudimos cargar el mapa 3D (puede ser la conexión).<br>
      <a href="javascript:location.reload()" style="color:var(--red-deep);text-decoration:underline;">Reintentar</a>
    </p>`;
}, 9000);