import * as THREE from 'three';
import { buildFaceClusters } from './faceClusters.js';
import { buildLogoZoneClusters } from './logoZones.js';

const MAX_CANVAS_DIM = 1600;
const MIN_CANVAS_DIM = 300;

// Resuelve un sistema 3x3 por Cramer. Devuelve null si es (casi) singular.
function solve3x3(A, b) {
  const det3 = (m) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

  const D = det3(A);
  if (Math.abs(D) < 1e-9) return null;

  const withCol = (col, vec) => A.map((row, i) => row.map((v, j) => (j === col ? vec[i] : v)));
  const Dx = det3(withCol(0, b));
  const Dy = det3(withCol(1, b));
  const Dz = det3(withCol(2, b));
  return [Dx / D, Dy / D, Dz / D];
}

/**
 * Ajuste de círculo 2D por mínimos cuadrados (método de Kasa): dado un set
 * de puntos [x,y], encuentra el centro (cx,cy) y radio r que mejor los
 * explica. Se usa para "desenrollar" el perfil de una rampa curva (quarter
 * pipe / transición) proyectado en el plano perpendicular a su eje de
 * extrusión. Devuelve null si el sistema es singular (puntos degenerados).
 */
function fitCircleKasa(points) {
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
  const n = points.length;
  for (const [x, y] of points) {
    const z = x * x + y * y;
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
    sxz += x * z; syz += y * z; sz += z;
  }
  const A = [
    [sxx, sxy, sx],
    [sxy, syy, sy],
    [sx, sy, n],
  ];
  const b = [sxz, syz, sz];
  const sol = solve3x3(A, b);
  if (!sol) return null;
  const [D, E, F] = sol;
  const cx = D / 2;
  const cy = E / 2;
  const r2 = F + cx * cx + cy * cy;
  if (!(r2 > 0)) return null;
  return { cx, cy, r: Math.sqrt(r2) };
}

export class RampLogoManager {
  constructor(options = {}) {
    this.currentImage = null;
    this.texture = null;
    this.material = null;

    this.clusters = [];
    this.activeClusterIndex = -1;
    this.canvasAspect = 1; // width / height del panel real

    // Orientación manual del logo dentro del canvas. La proyección UV (plana
    // o cilíndrica) no tiene forma de saber "para dónde es arriba" en la
    // superficie real de la rampa — el ángulo/tangente que arma queda con
    // una orientación arbitraria. Por eso se expone control manual (botones
    // en la UI) en vez de intentar adivinarlo.
    this.rotation = 0; // 0 | 90 | 180 | 270 (grados, sentido horario)
    this.flipH = false;
    this.flipV = false;

    this.initCanvas();
    this.initMaterial();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = MAX_CANVAS_DIM;
    this.canvas.height = MAX_CANVAS_DIM;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.renderBlankCanvas();
    this.recreateTexture();
  }

  /**
   * Crea un CanvasTexture nuevo desde cero (y lo asigna al material, si ya
   * existe). Se usa en vez de mutar el mismo objeto CanvasTexture cuando el
   * canvas cambia de TAMAÑO REAL (resizeCanvasToAspect): reusar el mismo
   * objeto ahí hace que Three.js intente actualizar la textura en la GPU
   * con un texSubImage2D parcial contra el tamaño VIEJO ya subido, lo que
   * tira "GL_INVALID_VALUE: ...Offset overflows texture dimensions" en
   * consola y deja la textura corrupta/en blanco (el logo no se ve, sea
   * cual sea la cara). Recrear el objeto fuerza una reasignación completa.
   */
  recreateTexture() {
    this.texture?.dispose();
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    // Sin mipmaps: MAX_CANVAS_DIM/MIN_CANVAS_DIM no son potencia de 2, y
    // CanvasTexture + generateMipmaps=true + dimensiones NPOT dispara
    // "GL_INVALID_VALUE: ...Offset overflows texture dimensions" en el
    // backend ANGLE de Chrome/Windows al generar los niveles más chicos
    // (pasa siempre, no solo al resize). No los necesitamos: es un logo
    // 2D plano en primer plano, no una textura vista de lejos.
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;

    if (this.material) {
      this.material.map = this.texture;
      this.material.needsUpdate = true;
    }
  }

  initMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.65,
      metalness: 0.0,
      map: this.texture,
      side: THREE.DoubleSide,
    });
    // Se reusa entre modelos/clusters al cambiar de spot — que scene.js no lo dispose().
    this.material.userData.isLogoMaterial = true;
  }

  renderBlankCanvas() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Redimensiona el canvas para que coincida con el aspect ratio REAL del panel
   * (uRange/vRange), preservando resolución total ~MAX_CANVAS_DIM en el lado
   * más largo. Sin esto, un canvas cuadrado mapeado sobre un panel angosto y
   * largo (o viceversa) deforma el logo aunque el dibujo interno esté bien
   * proporcionado — el estiramiento pasa en el mapeo, no en el canvas.
   */
  resizeCanvasToAspect(aspectWH) {
    this.canvasAspect = aspectWH > 0 ? aspectWH : 1;
    let w, h;
    if (this.canvasAspect >= 1) {
      w = MAX_CANVAS_DIM;
      h = Math.max(MIN_CANVAS_DIM, Math.round(MAX_CANVAS_DIM / this.canvasAspect));
    } else {
      h = MAX_CANVAS_DIM;
      w = Math.max(MIN_CANVAS_DIM, Math.round(MAX_CANVAS_DIM * this.canvasAspect));
    }
    const sizeChanged = this.canvas.width !== w || this.canvas.height !== h;
    this.canvas.width = w;
    this.canvas.height = h;

    // Reasignación completa de la textura SOLO cuando el tamaño real del
    // canvas cambió (ver comentario en recreateTexture) — evitamos
    // recrearla en cada cluster/logo si el tamaño no se movió.
    if (sizeChanged) {
      this.recreateTexture();
    }

    this.renderBlankCanvas();
    if (this.currentImage) {
      this.setLogo(this.currentImage);
    } else {
      this.texture.needsUpdate = true;
    }
  }

  /**
   * Proyección UV en runtime (no usa las UV del .glb). Dos modos:
   *
   *  1) CILÍNDRICA: si el cluster target es una curva barrida en línea recta
   *     a lo largo de un eje (caso típico de una rampa de transición/quarter:
   *     la normal de CADA triángulo tiene componente ~0 en ese eje), se ajusta
   *     un círculo 2D al perfil de la curva y se desenrolla por ángulo·radio
   *     (longitud de arco real en metros) — así el logo no se aplasta ni se
   *     duplica al seguir la curva.
   *  2) PLANA (fallback): si no hay un eje de extrusión claro o el ajuste de
   *     círculo no es limpio (superficie no es un barrido simple), se usa la
   *     proyección plana original: normal promedio ponderada por área +
   *     base tangente/bitangente.
   *
   * Devuelve el aspect ratio real (uRange/vRange) del panel para dimensionar
   * el canvas, en ambos modos.
   */
  applyPlanarUVs(targetMeshes) {
    if (!targetMeshes || targetMeshes.length === 0) return { uRange: 1, vRange: 1 };

    const extrusion = this.detectExtrusionAxis(targetMeshes);
    if (extrusion && extrusion.isClear) {
      const cyl = this.tryCylindricalUV(targetMeshes, extrusion.axis);
      if (cyl) {
        console.log(
          `%c[RampLogoManager] Proyección cilíndrica (radio≈${cyl.circle.r.toFixed(2)}m, eje=${['X', 'Y', 'Z'][extrusion.axis]})`,
          'color: #a78bfa;'
        );
        return cyl.ranges;
      }
    }

    console.log('%c[RampLogoManager] Proyección plana (tangente/bitangente)', 'color: #a78bfa;');
    return this.applyFlatPlanarUVs(targetMeshes);
  }

  /**
   * Detecta si el cluster target es un barrido/extrusión recta: compara,
   * ponderado por área, el RMS de la componente de la normal de cada
   * triángulo en X/Y/Z. En una extrusión recta a lo largo de un eje, TODAS
   * las normales son perpendiculares a ese eje (componente ~0), no solo en
   * promedio — por eso funciona incluso si la curva se dobla sobre sí misma.
   */
  detectExtrusionAxis(targetMeshes) {
    const axisNormalSqSum = [0, 0, 0];
    let totalArea = 0;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const n = new THREE.Vector3();

    targetMeshes.forEach((mesh) => {
      const pos = mesh.geometry.attributes.position;
      const index = mesh.geometry.index;
      const triCount = index ? index.count / 3 : pos.count / 3;
      for (let t = 0; t < triCount; t++) {
        const ia = index ? index.getX(t * 3) : t * 3;
        const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1;
        const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2;
        a.fromBufferAttribute(pos, ia);
        b.fromBufferAttribute(pos, ib);
        c.fromBufferAttribute(pos, ic);
        THREE.Triangle.getNormal(a, b, c, n);
        const area = new THREE.Triangle(a, b, c).getArea();
        if (area > 0 && n.lengthSq() > 0) {
          axisNormalSqSum[0] += n.x * n.x * area;
          axisNormalSqSum[1] += n.y * n.y * area;
          axisNormalSqSum[2] += n.z * n.z * area;
          totalArea += area;
        }
      }
    });

    if (totalArea === 0) return null;

    let axis = 0;
    for (let i = 1; i < 3; i++) {
      if (axisNormalSqSum[i] < axisNormalSqSum[axis]) axis = i;
    }
    const rms = Math.sqrt(axisNormalSqSum[axis] / totalArea);
    return { axis, rms, isClear: rms < 0.35 };
  }

  /**
   * Intenta un desenrollado cilíndrico: proyecta los vértices al plano
   * perpendicular al eje de extrusión, ajusta un círculo 2D (mínimos
   * cuadrados) a ese perfil, y si el ajuste es limpio (los puntos quedan
   * realmente sobre el círculo) arma U = ángulo·radio (arco real en metros)
   * y V = coordenada cruda en el eje de extrusión. Devuelve null si el
   * ajuste no es confiable (curva no es un arco simple) para que el caller
   * caiga al modo plano.
   */
  tryCylindricalUV(targetMeshes, extrusionAxis) {
    const planeAxes = [0, 1, 2].filter((ax) => ax !== extrusionAxis);
    const getComp = (v3, axisIdx) => (axisIdx === 0 ? v3.x : axisIdx === 1 ? v3.y : v3.z);

    const entries = [];
    const P = [];
    const vtmp = new THREE.Vector3();

    targetMeshes.forEach((mesh) => {
      const pos = mesh.geometry.attributes.position;
      entries.push({ mesh, pos });
      for (let i = 0; i < pos.count; i++) {
        vtmp.fromBufferAttribute(pos, i);
        P.push([getComp(vtmp, planeAxes[0]), getComp(vtmp, planeAxes[1])]);
      }
    });

    if (P.length < 8) return null;

    const circle = fitCircleKasa(P);
    if (!circle || !(circle.r > 0.05) || !(circle.r < 1000)) return null;

    let sqErr = 0;
    for (const [x, y] of P) {
      const d = Math.hypot(x - circle.cx, y - circle.cy);
      sqErr += (d - circle.r) * (d - circle.r);
    }
    const rmsErr = Math.sqrt(sqErr / P.length);
    if (rmsErr / circle.r > 0.05) return null;

    let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
    const rawUVs = [];

    entries.forEach(({ mesh, pos }) => {
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        vtmp.fromBufferAttribute(pos, i);
        const p = getComp(vtmp, planeAxes[0]);
        const q = getComp(vtmp, planeAxes[1]);
        const angle = Math.atan2(q - circle.cy, p - circle.cx);
        const u = angle * circle.r;
        const v = getComp(vtmp, extrusionAxis);
        uv[i * 2] = u;
        uv[i * 2 + 1] = v;
        if (u < uMin) uMin = u;
        if (u > uMax) uMax = u;
        if (v < vMin) vMin = v;
        if (v > vMax) vMax = v;
      }
      rawUVs.push({ mesh, uv });
    });

    const uRange = uMax - uMin || 1;
    const vRange = vMax - vMin || 1;

    rawUVs.forEach(({ mesh, uv }) => {
      for (let i = 0; i < uv.length / 2; i++) {
        uv[i * 2] = (uv[i * 2] - uMin) / uRange;
        uv[i * 2 + 1] = (uv[i * 2 + 1] - vMin) / vRange;
      }
      mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      mesh.geometry.attributes.uv.needsUpdate = true;
    });

    return { circle, ranges: { uRange, vRange } };
  }

  /**
   * Proyección plana original: normal promedio ponderada por área del
   * cluster target + base tangente/bitangente. Fallback para superficies
   * que no son un barrido/extrusión simple (paneles chatos, o curvas
   * irregulares donde el ajuste de círculo no es confiable).
   */
  applyFlatPlanarUVs(targetMeshes) {
    const worldUp = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3();
    const centroid = new THREE.Vector3();
    let totalArea = 0;
    let totalVerts = 0;

    const triA = new THREE.Vector3();
    const triB = new THREE.Vector3();
    const triC = new THREE.Vector3();
    const triNormal = new THREE.Vector3();

    targetMeshes.forEach((mesh) => {
      const pos = mesh.geometry.attributes.position;
      const index = mesh.geometry.index;
      const triCount = index ? index.count / 3 : pos.count / 3;

      for (let t = 0; t < triCount; t++) {
        const ia = index ? index.getX(t * 3) : t * 3;
        const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1;
        const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2;
        triA.fromBufferAttribute(pos, ia);
        triB.fromBufferAttribute(pos, ib);
        triC.fromBufferAttribute(pos, ic);
        THREE.Triangle.getNormal(triA, triB, triC, triNormal);
        const area = new THREE.Triangle(triA, triB, triC).getArea();
        if (area > 0 && triNormal.lengthSq() > 0) {
          normal.addScaledVector(triNormal, area);
          totalArea += area;
        }
      }

      for (let i = 0; i < pos.count; i++) {
        centroid.x += pos.getX(i);
        centroid.y += pos.getY(i);
        centroid.z += pos.getZ(i);
        totalVerts++;
      }
    });

    if (totalArea === 0 || totalVerts === 0) return { uRange: 1, vRange: 1 };
    normal.normalize();
    centroid.divideScalar(totalVerts);

    let refUp = worldUp;
    if (Math.abs(normal.dot(worldUp)) > 0.98) {
      refUp = new THREE.Vector3(1, 0, 0);
    }
    const tangent = new THREE.Vector3().crossVectors(refUp, normal).normalize();
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
    const rel = new THREE.Vector3();
    const rawUVs = [];

    targetMeshes.forEach((mesh) => {
      const pos = mesh.geometry.attributes.position;
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        rel.set(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(centroid);
        const u = rel.dot(tangent);
        const v = rel.dot(bitangent);
        uv[i * 2] = u;
        uv[i * 2 + 1] = v;
        if (u < uMin) uMin = u;
        if (u > uMax) uMax = u;
        if (v < vMin) vMin = v;
        if (v > vMax) vMax = v;
      }
      rawUVs.push({ mesh, uv });
    });

    const uRange = uMax - uMin || 1;
    const vRange = vMax - vMin || 1;

    rawUVs.forEach(({ mesh, uv }) => {
      for (let i = 0; i < uv.length / 2; i++) {
        uv[i * 2] = (uv[i * 2] - uMin) / uRange;
        uv[i * 2 + 1] = (uv[i * 2 + 1] - vMin) / vRange;
      }
      mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      mesh.geometry.attributes.uv.needsUpdate = true;
    });

    return { uRange, vRange };
  }

  /** Saca el material target de los meshes del cluster previo, devolviéndoles su material original. */
  releaseCurrentCluster() {
    if (this.activeClusterIndex < 0 || !this.clusters[this.activeClusterIndex]) return;
    this.clusters[this.activeClusterIndex].members.forEach((m) => {
      if (m.mesh.userData.__originalMaterial) {
        m.mesh.material = m.mesh.userData.__originalMaterial;
      }
    });
  }

  applyCluster(index) {
    const cluster = this.clusters[index];
    if (!cluster) return;

    this.releaseCurrentCluster();
    this.activeClusterIndex = index;

    const meshes = cluster.members.map((m) => m.mesh);
    const { uRange, vRange } = this.applyPlanarUVs(meshes);
    this.resizeCanvasToAspect(uRange / vRange);

    meshes.forEach((mesh) => {
      if (!mesh.userData.__originalMaterial) {
        mesh.userData.__originalMaterial = mesh.material;
      }
      mesh.material = this.material;
      mesh.material.needsUpdate = true;
    });

    console.log(
      `%c[RampLogoManager] Cara activa: #${index} de ${this.clusters.length} (${meshes.length} fragmento(s), aspect ${(uRange / vRange).toFixed(2)})`,
      'color: #10b981;'
    );
  }

  nextCluster() {
    if (this.clusters.length === 0) return;
    this.applyCluster((this.activeClusterIndex + 1) % this.clusters.length);
  }

  prevCluster() {
    if (this.clusters.length === 0) return;
    this.applyCluster((this.activeClusterIndex - 1 + this.clusters.length) % this.clusters.length);
  }

  /**
   * Detecta dónde va el logo del modelo recién cargado. Prioridad:
   *   1) Zonas nombradas a mano en Rhino ("LogoZone", "LogoZone_1", ...) —
   *      si el modelo trae al menos una, se usan EXCLUSIVAMENTE (sin
   *      heurística, cero ambigüedad).
   *   2) Si no hay ninguna zona nombrada, cae al clustering automático por
   *      cercanía+normal (buildFaceClusters) como venía funcionando antes,
   *      para no romper modelos que todavía no fueron re-exportados con
   *      una LogoZone.
   * `allMeshes` es el array de scene.js.
   */
  bindMeshes(allMeshes) {
    const zoneClusters = buildLogoZoneClusters(allMeshes);

    if (zoneClusters.length > 0) {
      this.clusters = zoneClusters;
      this.usingZones = true;
    } else {
      this.clusters = buildFaceClusters(allMeshes, { materialName: 'Paint', requireUV: true });
      this.usingZones = false;
    }
    this.activeClusterIndex = -1;

    if (this.clusters.length > 0) {
      this.applyCluster(0);
    } else {
      console.warn('[RampLogoManager] No se encontró ninguna "LogoZone" ni ninguna cara con material Paint + UV0.');
    }
  }

  checkImageTransparency(image) {
    const testCanvas = document.createElement('canvas');
    const sampleSize = 64;
    testCanvas.width = sampleSize;
    testCanvas.height = sampleSize;
    const testCtx = testCanvas.getContext('2d');
    testCtx.drawImage(image, 0, 0, sampleSize, sampleSize);

    const imgData = testCtx.getImageData(0, 0, sampleSize, sampleSize).data;
    let hasAlpha = false;
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] < 250) {
        hasAlpha = true;
        break;
      }
    }
    return hasAlpha;
  }

  setLogo(image) {
    this.currentImage = image;
    this.hasTransparency = this.checkImageTransparency(image);

    this.renderBlankCanvas();

    // La proyección UV (plana o cilíndrica) no puede saber "para dónde es
    // arriba" en la rampa real — la orientación que le da al panel es
    // arbitraria. this.rotation/flipH/flipV son el ajuste manual del
    // usuario para corregirla (ver rotateLogo/flipLogoHorizontal/Vertical).
    const rotated90 = this.rotation === 90 || this.rotation === 270;
    const availW = rotated90 ? this.canvas.height : this.canvas.width;
    const availH = rotated90 ? this.canvas.width : this.canvas.height;

    const targetCoverage = 0.78;
    const maxW = availW * targetCoverage;
    const maxH = availH * targetCoverage;
    const scale = Math.min(maxW / image.width, maxH / image.height);
    const drawW = image.width * scale;
    const drawH = image.height * scale;

    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate((this.rotation * Math.PI) / 180);
    this.ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    this.ctx.restore();

    this.texture.needsUpdate = true;

    return {
      hasTransparency: this.hasTransparency,
      width: image.width,
      height: image.height,
      drawWidth: Math.round(drawW),
      drawHeight: Math.round(drawH),
    };
  }

  /** Gira el logo 90° en sentido horario (acumulativo: 0→90→180→270→0). */
  rotateLogo() {
    this.rotation = (this.rotation + 90) % 360;
    if (this.currentImage) this.setLogo(this.currentImage);
  }

  flipLogoHorizontal() {
    this.flipH = !this.flipH;
    if (this.currentImage) this.setLogo(this.currentImage);
  }

  flipLogoVertical() {
    this.flipV = !this.flipV;
    if (this.currentImage) this.setLogo(this.currentImage);
  }

  clearLogo() {
    this.currentImage = null;
    this.hasTransparency = true;
    this.renderBlankCanvas();
    this.texture.needsUpdate = true;
  }
}
