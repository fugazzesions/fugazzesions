import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class RampScene {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onProgress = options.onProgress || (() => {});
    this.onLoaded = options.onLoaded || (() => {});
    this.onError = options.onError || (() => {});
    
    this.meshes = [];
    this.model = null;
    this.initialCameraPosition = new THREE.Vector3(2.8, 2.2, 3.8);
    this.targetCenter = new THREE.Vector3(0, 0.35, 0);

    this.initScene();
    this.initLights();
    this.initControls();
    this.initResizeListener();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0e12);

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.copy(this.initialCameraPosition);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  initLights() {
    // Ambient Light - soft neutral illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    // Main Key Light - angled from top-front
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.0001;
    const d = 4;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    this.scene.add(keyLight);

    // Fill Light - softer from left side
    const fillLight = new THREE.DirectionalLight(0x8ba2c4, 1.0);
    fillLight.position.set(-5, 3, -2);
    this.scene.add(fillLight);

    // Rim Light - subtle highlight on metallic edges
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 4, -6);
    this.scene.add(rimLight);

    // Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0x2d3444, 0x0c0e12, 0.8);
    this.scene.add(hemiLight);

    // Ground Contact Shadow Receiver
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.001;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Subtle floor grid helper for spatial context
    const grid = new THREE.GridHelper(20, 20, 0x222735, 0x161a24);
    grid.position.y = 0;
    this.scene.add(grid);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 1.0;
    this.controls.maxDistance = 14.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.02; // prevent going below ground
    this.controls.target.copy(this.targetCenter);
    this.controls.update();
  }

  initResizeListener() {
    window.addEventListener('resize', () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  disposeCurrentModel() {
    if (!this.model) return;
    this.scene.remove(this.model);
    this.model.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (!mat) return;
          // No tocar el material propio del logo (RampLogoManager lo reusa entre modelos)
          if (mat.userData?.isLogoMaterial) return;
          mat.map?.dispose();
          mat.dispose();
        });
      }
    });
    this.model = null;
  }

  loadModel(url = '/spot1.glb') {
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        // Sacar el modelo anterior antes de meter el nuevo (si no, se apilan)
        this.disposeCurrentModel();

        this.model = gltf.scene;
        this.meshes = [];

        // Collect and inspect all meshes
        let meshIndex = 0;
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.meshIndex = meshIndex;

            // Fix obligatorio: exportación de Rhino trae winding/normales
            // inconsistentes entre caras -> con FrontSide (default) ciertas caras
            // se ven "transparentes"/desaparecen según el ángulo de cámara.
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
              if (mat) mat.side = THREE.DoubleSide;
            });

            // Geometry bounding box calculation
            if (!child.geometry.boundingBox) {
              child.geometry.computeBoundingBox();
            }

            const matName = child.material ? child.material.name : 'Unknown';
            const hasUV = Boolean(child.geometry.attributes.uv);
            const vertCount = child.geometry.attributes.position ? child.geometry.attributes.position.count : 0;
            const bbox = child.geometry.boundingBox;
            const size = new THREE.Vector3();
            bbox.getSize(size);

            this.meshes.push({
              index: meshIndex,
              mesh: child,
              name: child.name || child.parent?.name || '',
              materialName: matName,
              vertexCount: vertCount,
              hasUV: hasUV,
              boundingBox: bbox,
              size: size,
              material: child.material
            });

            meshIndex++;
          }
        });

        // Diagnostic table in console. La columna "Name" sirve para verificar
        // a ojo si Rhino exportó el nombre del objeto (ej. "LogoZone") tal
        // cual se ve acá — logoZones.js usa ese mismo nombre para detectar
        // zonas manuales.
        console.group(`%c[GLTF Diagnostic] Model ${url} Loaded`, 'color: #6366f1; font-weight: bold; font-size: 13px;');
        console.log(`Total Meshes found: ${this.meshes.length}`);
        console.table(
          this.meshes.map((m) => ({
            Index: m.index,
            Name: m.name,
            Material: m.materialName,
            Vertices: m.vertexCount,
            HasUV: m.hasUV,
            'Size (X,Y,Z)': `${m.size.x.toFixed(2)} × ${m.size.y.toFixed(2)} × ${m.size.z.toFixed(2)}`,
            'Min (X,Y,Z)': `[${m.boundingBox.min.x.toFixed(2)}, ${m.boundingBox.min.y.toFixed(2)}, ${m.boundingBox.min.z.toFixed(2)}]`,
            'Max (X,Y,Z)': `[${m.boundingBox.max.x.toFixed(2)}, ${m.boundingBox.max.y.toFixed(2)}, ${m.boundingBox.max.z.toFixed(2)}]`
          }))
        );
        console.groupEnd();

        // Calculate model bounding box and center
        const totalBox = new THREE.Box3().setFromObject(this.model);
        const center = new THREE.Vector3();
        totalBox.getCenter(center);
        const size = new THREE.Vector3();
        totalBox.getSize(size);

        // Adjust model so base sits at Y = 0 and is centered on X & Z
        this.model.position.x = -center.x;
        this.model.position.z = -center.z;
        this.model.position.y = -totalBox.min.y;

        this.scene.add(this.model);

        // Target camera at center of ramp
        this.targetCenter.set(0, size.y * 0.4, 0);
        this.controls.target.copy(this.targetCenter);

        // Set default camera distance
        const maxDim = Math.max(size.x, size.y, size.z);
        this.camera.position.set(maxDim * 0.75, maxDim * 0.6, maxDim * 1.0);
        this.initialCameraPosition.copy(this.camera.position);
        this.controls.update();

        this.onLoaded({
          model: this.model,
          meshes: this.meshes,
          totalBox: totalBox
        });
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = (xhr.loaded / xhr.total) * 100;
          this.onProgress(percent);
        }
      },
      (error) => {
        console.error('Error loading GLTF model:', error);
        this.onError(error);
      }
    );
  }

  resetCamera() {
    this.controls.target.copy(this.targetCenter);
    this.camera.position.copy(this.initialCameraPosition);
    this.controls.update();
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
