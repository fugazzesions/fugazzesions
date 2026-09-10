import * as THREE from 'three';
import { computeMeshNormalAndArea } from './faceClusters.js';

/**
 * Convención de nombres para zonas manuales creadas en Rhino:
 *   "LogoZone"          -> zona única
 *   "LogoZone_1" / "_2"  -> varias zonas en el mismo modelo (se ciclan con
 *                           el botón "Cambiar cara" de la UI, igual que los
 *                           clusters automáticos)
 * No distingue mayúsculas/minúsculas ni separador (_, -, espacio).
 */
const ZONE_NAME_RE = /logozone[\s_-]?(\d+)?/i;

function extractZoneKey(name) {
  if (!name) return null;
  const match = name.match(ZONE_NAME_RE);
  if (!match) return null;
  const suffix = match[1] ? `_${match[1]}` : '';
  return `logozone${suffix}`;
}

/**
 * Un mesh se considera parte de una LogoZone si su propio nombre matchea,
 * o si el nombre del nodo padre matchea (Rhino a veces envuelve el mesh en
 * un grupo con el nombre del objeto y deja el mesh hijo con un nombre
 * genérico autogenerado).
 */
export function findZoneKey(mesh) {
  return extractZoneKey(mesh.name) || extractZoneKey(mesh.parent?.name);
}

/**
 * Agrupa los meshes por zona nombrada explícitamente en Rhino (ver
 * ZONE_NAME_RE). A diferencia de faceClusters.js, acá NO hay heurística:
 * el autor del modelo ya definió a mano cuál es la superficie target, así
 * que alcanza con juntar por nombre exacto. Devuelve el mismo shape
 * {members, area, box} que buildFaceClusters para que sea intercambiable
 * en RampLogoManager (applyCluster/next/prevCluster no necesitan saber de
 * dónde salió el cluster).
 */
export function buildLogoZoneClusters(allMeshes) {
  const groups = new Map();

  allMeshes.forEach((m) => {
    const key = findZoneKey(m.mesh);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  });

  const clusters = Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([key, members]) => {
      const box = new THREE.Box3();
      let area = 0;
      members.forEach((m) => {
        box.union(m.boundingBox);
        area += computeMeshNormalAndArea(m.mesh.geometry).area;
      });
      return { key, members, area, box };
    });

  if (clusters.length > 0) {
    console.log(
      `%c[LogoZones] ${clusters.length} zona(s) manual(es) detectada(s) por nombre:`,
      'color: #22d3ee; font-weight: bold;',
      clusters.map((c) => `${c.key}: ${c.members.length} fragmento(s), área≈${c.area.toFixed(2)}m²`)
    );
  }

  return clusters;
}
