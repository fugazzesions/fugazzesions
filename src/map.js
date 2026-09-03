/* ============================================================
   MAPA 3D — módulo aparte: si el import de three.js falla (red, CDN,
   bloqueador), esta sección queda inerte pero el resto del sitio
   (textos, fotos, marcas, edición) ya se renderizó en el módulo anterior.
   ============================================================ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const { SITE_DATA, ASSETS, EDITIONS, HOTSPOTS, getPath } = window.__FUGA;
window.__FUGA_MAP_SCRIPT_LOADED = true;

const stage = document.querySelector('.map-stage');
const canvas = document.getElementById('map-canvas');
const loadingEl = document.getElementById('map-loading');
const barFill = document.getElementById('map-bar-fill');
const pctEl = document.getElementById('map-pct');
const soonEl = document.getElementById('map-soon');
const soonTitle = document.getElementById('map-soon-title');
const hintEl = document.getElementById('map-hint');
const panelEl = document.getElementById('map-panel');
const panelTitle = document.getElementById('panel-title');
const panelDesc = document.getElementById('panel-desc');
const legendEl = document.getElementById('map-legend');
const switchEl = document.getElementById('ed-switch');

let renderer, scene, camera, controls, raycaster, currentModel;
let hotspotObjects = [];
let activeEdition = null;
const loadedCache = {};

function initThree(){
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, logarithmicDepthBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x17130D);
  scene.fog = new THREE.Fog(0x17130D, 30, 90);

  camera = new THREE.PerspectiveCamera(50, 1, 0.05, 500);

  const hemi = new THREE.HemisphereLight(0xfff2d9, 0x2a1f14, 1.1);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xfff0dd, 2.1);
  dir.position.set(8, 14, 6);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0xffd9c2, 0.6);
  fill.position.set(-10, 6, -8);
  scene.add(fill);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1;
  controls.maxDistance = 60;
  controls.maxPolarAngle = Math.PI * 0.49;

  raycaster = new THREE.Raycaster();

  resizeRenderer();
  window.addEventListener('resize', resizeRenderer);
  // window.resize NO se dispara cuando el layout cambia por otras razones
  // (una fuente que termina de cargar, una imagen que reserva su espacio,
  // una barra de scroll que aparece/desaparece al crecer la página) — eso
  // podía dejar el mapa con el tamaño/aspecto viejo hasta que el usuario
  // interactuaba con algo que sí disparara un resize. ResizeObserver
  // cubre cualquier cambio de tamaño del contenedor, pase lo que pase.
  if (window.ResizeObserver){
    const ro = new ResizeObserver(() => {
      resizeRenderer();
      renderer.render(scene, camera);
    });
    ro.observe(stage);
  }

  let downPos = null;
  renderer.domElement.addEventListener('pointerdown', e => { downPos = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!downPos) return;
    const dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
    if (Math.hypot(dx, dy) < 6) handlePick(e);
    downPos = null;
  });

  animate();
}

function resizeRenderer(){
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function clearModel(){
  if (currentModel){
    scene.remove(currentModel);
    currentModel.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material){
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(m => m.dispose && m.dispose());
      }
    });
    currentModel = null;
  }
  hotspotObjects = [];
  legendEl.innerHTML = '';
  setPanel(null);
}

function setLoading(pct){
  loadingEl.style.display = 'flex';
  loadingEl.style.opacity = '1';
  barFill.style.width = Math.max(4, pct) + '%';
  pctEl.textContent = `Cargando modelo 3D… ${Math.round(pct)}%`;
}
function hideLoading(){
  loadingEl.style.opacity = '0';
  setTimeout(() => { loadingEl.style.display = 'none'; }, 400);
}

function showSoon(ed){
  canvas.style.visibility = 'hidden';
  hintEl.style.visibility = 'hidden';
  loadingEl.style.display = 'none';
  soonEl.hidden = false;
  soonTitle.textContent = ed.label;
  document.getElementById('map-soon-text').textContent =
    ed.id === 4 ? SITE_DATA.edition4.soonText : `Todavía no cargamos el modelo 3D de la Fugazzesions ${ed.label}. Va a estar disponible acá pronto.`;
}
function hideSoon(){
  canvas.style.visibility = 'visible';
  hintEl.style.visibility = 'visible';
  soonEl.hidden = true;
}

function setPanel(hit){
  if (!hit){
    panelEl.classList.add('empty');
    panelTitle.textContent = 'Elegí un punto del mapa';
    panelDesc.textContent = 'Tocá cualquier sector del modelo 3D — la pista, la barra, el sector DJ — para ver de qué se trata.';
    return;
  }
  panelEl.classList.remove('empty');
  panelTitle.textContent = hit.title;
  panelDesc.textContent = hit.desc;
  legendEl.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.name === hit.key));
}

function buildLegend(){
  legendEl.innerHTML = '';
  hotspotObjects.forEach(h => {
    const btn = document.createElement('button');
    btn.textContent = HOTSPOTS[h.name].title;
    btn.dataset.name = h.name;
    btn.addEventListener('click', () => focusHotspot(h));
    legendEl.appendChild(btn);
  });
}

function handlePick(e){
  if (!currentModel) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(currentModel.children, true);
  if (!intersects.length) return;
  let obj = intersects[0].object;
  while (obj && !(obj.userData && obj.userData.hotspotName)) obj = obj.parent;
  if (!obj) return;
  const entry = hotspotObjects.find(h => h.name === obj.userData.hotspotName);
  if (entry) focusHotspot(entry);
}

function focusHotspot(entry){
  const info = HOTSPOTS[entry.name];
  setPanel({ key: entry.name, title: info.title, desc: info.desc });

  const box = entry.box;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const dist = Math.max(size.length() * 1.15, 3);

  const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
  if (!isFinite(dir.x) || dir.lengthSq() === 0) dir.set(0.6, 0.5, 0.6);
  const newCamPos = new THREE.Vector3().addVectors(center, dir.multiplyScalar(dist));
  newCamPos.y = Math.max(newCamPos.y, center.y + size.y * 0.3);

  tweenCamera(newCamPos, center, 700);
}

function tweenCamera(toPos, toTarget, duration){
  const fromPos = camera.position.clone();
  const fromTarget = controls.target.clone();
  const start = performance.now();
  controls.enabled = false;
  function step(now){
    const t = Math.min(1, (now - start) / duration);
    const e = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(fromPos, toPos, e);
    controls.target.lerpVectors(fromTarget, toTarget, e);
    if (t < 1) requestAnimationFrame(step);
    else controls.enabled = true;
  }
  requestAnimationFrame(step);
}

function frameWholeModel(model){
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const dist = Math.max(size.length() * 0.62, 4);
  camera.position.copy(center).add(new THREE.Vector3(dist * 0.75, dist * 0.55, dist * 0.75));
  controls.target.copy(center);
  controls.minDistance = dist * 0.08;
  controls.maxDistance = dist * 2.2;
  controls.update();
}

function loadEdition(ed){
  activeEdition = ed.id;
  updateSwitchUI();

  if (!ed.model){
    clearModel();
    showSoon(ed);
    return;
  }
  hideSoon();

  if (loadedCache[ed.id]){
    clearModel();
    attachModel(loadedCache[ed.id].clone(true));
    return;
  }

  setLoading(4);
  const loader = new GLTFLoader();
  loader.load(
    ed.model,
    gltf => {
      loadedCache[ed.id] = gltf.scene;
      clearModel();
      attachModel(gltf.scene);
      hideLoading();
    },
    xhr => {
      if (xhr.total) setLoading((xhr.loaded / xhr.total) * 100);
    },
    err => {
      pctEl.textContent = 'No se pudo cargar el modelo 3D.';
      console.error(err);
    }
  );
}

function attachModel(root){
  currentModel = root;
  scene.add(root);

  root.traverse(o => {
    if (o.isMesh){
      o.castShadow = false;
      o.receiveShadow = false;
      // El modelo exportado tiene caras con normales/orden de vértices
      // inconsistente: algunas paredes solo se ven de un lado y "desaparecen"
      // (dejan ver el fondo negro) según el ángulo de cámara — la pared de
      // atrás en vez de la de adelante, cajones que se ven mal, etc.
      // Forzamos DoubleSide para que toda cara se dibuje se la mire desde
      // donde se la mire.
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => { if (m) m.side = THREE.DoubleSide; });
    }
  });

  Object.keys(HOTSPOTS).forEach(name => {
    const node = root.getObjectByName(name);
    if (!node) return;
    const box = new THREE.Box3().setFromObject(node);
    node.traverse(o => { o.userData.hotspotName = name; });
    hotspotObjects.push({ name, object: node, box });
  });

  buildLegend();
  // El modelo puede tardar en bajar (2-3MB); en ese lapso el layout de la
  // página puede haber cambiado (fotos/fuentes terminando de cargar). Re
  // calculamos el tamaño/aspecto justo antes de encuadrar la cámara para
  // no arrastrar un valor viejo.
  resizeRenderer();
  frameWholeModel(root);
  // Pintamos ya este frame en vez de esperar al próximo tick del loop —
  // así lo primero que se ve, apenas se oculta el "cargando", ya está
  // con el encuadre final.
  renderer.render(scene, camera);
}

function updateSwitchUI(){
  switchEl.querySelectorAll('.ed-btn').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.id) === activeEdition);
  });
}

function buildSwitch(){
  switchEl.innerHTML = '';
  EDITIONS.forEach(ed => {
    const btn = document.createElement('button');
    btn.className = 'ed-btn' + (!ed.model ? ' soon' : '');
    btn.dataset.id = ed.id;
    const tag = ed.tagKey ? getPath(SITE_DATA, ed.tagKey).split('·')[1]?.trim() : null;
    btn.innerHTML = `Fugazzesions ${ed.label}` + (tag ? `<span class="tag">${tag}</span>` : (!ed.model ? `<span class="tag">próximamente</span>` : ''));
    btn.addEventListener('click', () => loadEdition(ed));
    switchEl.appendChild(btn);
  });
}

buildSwitch();
initThree();
loadEdition(EDITIONS.find(e => e.model) || EDITIONS[0]);