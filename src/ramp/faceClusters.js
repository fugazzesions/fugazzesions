import * as THREE from 'three';

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _triN = new THREE.Vector3();

// Normal promedio ponderada por área de UN mesh (no del cluster).
// Exportada: la reusa logoZones.js para calcular el área de las zonas manuales.
export function computeMeshNormalAndArea(geometry) {
  const pos = geometry.attributes.position;
  const index = geometry.index;
  const triCount = index ? index.count / 3 : pos.count / 3;
  const normal = new THREE.Vector3();
  let area = 0;

  for (let t = 0; t < triCount; t++) {
    const ia = index ? index.getX(t * 3) : t * 3;
    const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    _a.fromBufferAttribute(pos, ia);
    _b.fromBufferAttribute(pos, ib);
    _c.fromBufferAttribute(pos, ic);
    THREE.Triangle.getNormal(_a, _b, _c, _triN);
    const triArea = new THREE.Triangle(_a, _b, _c).getArea();
    if (triArea > 0 && _triN.lengthSq() > 0) {
      normal.addScaledVector(_triN, triArea);
      area += triArea;
    }
  }

  if (normal.lengthSq() > 0) normal.normalize();
  return { normal, area };
}

// Dos cajas se consideran físicamente adyacentes si se tocan o casi se tocan
// (margen chico por punto flotante).
function boxesTouch(b1, b2, eps = 0.03) {
  return (
    b1.min.x - eps <= b2.max.x && b2.min.x - eps <= b1.max.x &&
    b1.min.y - eps <= b2.max.y && b2.min.y - eps <= b1.max.y &&
    b1.min.z - eps <= b2.max.z && b2.min.z - eps <= b1.max.z
  );
}

/**
 * Agrupa los sub-meshes de `allMeshes` (formato scene.js) en clusters de
 * "misma cara física": dos fragmentos se fusionan SOLO si (a) sus cajas se
 * tocan y (b) sus normales apuntan aproximadamente para el mismo lado
 * (dot >= normalDotThreshold). Sin el chequeo (b), caras perpendiculares que
 * comparten arista (ej. el techo y el frente de un cajón) quedaban fusionadas
 * en un solo cluster, proyectando el logo repetido/espejado sobre varias
 * caras a la vez — o, si las normales quedaban opuestas (arriba/abajo),
 * cancelándose entre sí y dejando el logo invisible.
 *
 * Clusters ordenados de mayor a menor área real.
 */
export function buildFaceClusters(
  allMeshes,
  { materialName = 'Paint', requireUV = true, normalDotThreshold = 0.9 } = {}
) {
  const candidates = allMeshes
    .filter((m) => m.materialName === materialName && (!requireUV || m.hasUV))
    .map((m) => {
      const { normal, area } = computeMeshNormalAndArea(m.mesh.geometry);
      return { ...m, normal, area };
    })
    // Descartar fragmentos degenerados (área ~0, normal indefinida) — no aportan
    // superficie real y solo ensucian el clustering.
    .filter((m) => m.area > 1e-6 && m.normal.lengthSq() > 0);

  const parent = candidates.map((_, i) => i);
  function find(i) {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }
  function union(i, j) {
    const ri = find(i);
    const rj = find(j);
    if (ri !== rj) parent[ri] = rj;
  }

  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const touching = boxesTouch(candidates[i].boundingBox, candidates[j].boundingBox);
      if (!touching) continue;
      const aligned = candidates[i].normal.dot(candidates[j].normal) >= normalDotThreshold;
      if (aligned) union(i, j);
    }
  }

  const groups = new Map();
  candidates.forEach((m, i) => {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(m);
  });

  const clusters = Array.from(groups.values()).map((members) => {
    const area = members.reduce((sum, m) => sum + m.area, 0);
    const box = new THREE.Box3();
    members.forEach((m) => box.union(m.boundingBox));
    return { members, area, box };
  });

  clusters.sort((a, b) => b.area - a.area);

  console.log(
    `%c[FaceClusters] ${clusters.length} cara(s) detectada(s):`,
    'color: #f59e0b; font-weight: bold;',
    clusters.map((c, i) => `#${i}: ${c.members.length} fragmento(s), área≈${c.area.toFixed(2)}m²`)
  );

  return clusters;
}
