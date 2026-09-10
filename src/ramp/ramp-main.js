/* ============================================================
   Módulo aparte (como map.js): si algo acá falla, el resto de la
   página (contenido, mapa, marcas) ya se renderizó en main.js.
   ============================================================ */
import { RampScene } from './scene.js';
import { RampLogoManager } from './logoDecal.js';
import { MODELS, DEFAULT_MODEL_ID } from './models.js';

// Raíz de la sección: los listeners de drag&drop y paste se atan acá en
// vez de a `window` — si no, subir un PNG en CUALQUIER parte de la página
// (o pegar una imagen mientras se escribe en otro campo) terminaría
// activando esta herramienta.
const sectionRoot = document.getElementById('rampa');
if (sectionRoot) {
  // DOM Elements
  const canvasContainer = document.getElementById('canvas-container');
  const stageEl = document.getElementById('rampa-stage');
  const loadingOverlay = document.getElementById('loading-overlay');
  const dropZone = document.getElementById('drop-zone');
  const logoInput = document.getElementById('logo-input');
  const dropZoneIdle = document.getElementById('drop-zone-idle');
  const dropZoneActive = document.getElementById('drop-zone-active');
  const logoThumbnail = document.getElementById('logo-thumbnail');
  const fileNameEl = document.getElementById('file-name');
  const fileDimsEl = document.getElementById('file-dims');
  const btnChangeFile = document.getElementById('btn-change-file');
  const btnRemoveLogo = document.getElementById('btn-remove-logo');
  const btnResetView = document.getElementById('btn-reset-view');
  const alertNoTransparency = document.getElementById('alert-no-transparency');
  const alertError = document.getElementById('alert-error');
  const errorMessage = document.getElementById('error-message');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const versionChip = document.getElementById('version-chip');
  const loaderSub = document.getElementById('loader-sub');
  const modelList = document.getElementById('model-list');
  const faceControl = document.getElementById('face-control');
  const faceLabel = document.getElementById('face-label');
  const btnFacePrev = document.getElementById('btn-face-prev');
  const btnFaceNext = document.getElementById('btn-face-next');
  const zonePickerControl = document.getElementById('zone-picker-control');
  const zoneButtonsContainer = document.getElementById('zone-buttons');
  const btnRotateLogo = document.getElementById('btn-rotate-logo');
  const btnFlipH = document.getElementById('btn-flip-h');
  const btnFlipV = document.getElementById('btn-flip-v');

  // State
  let scene = null;
  let logoManager = null;
  let currentFile = null;
  let activeModelId = null;

  // Initialize Logo Manager (un solo manager, se re-usa entre modelos)
  logoManager = new RampLogoManager();

  // Initialize 3D Scene
  scene = new RampScene(canvasContainer, {
    onLoaded: ({ meshes }) => {
      setTimeout(() => {
        loadingOverlay.classList.add('fade-out');
      }, 250);

      logoManager.bindMeshes(meshes);
      updateFaceLabel();
      renderZonePicker();
    },
    onError: () => {
      loadingOverlay.classList.add('fade-out');
      showError('No se pudo cargar el modelo 3D. Verificá que los .glb estén en public/assets/ramp/.');
    },
  });

  // scene.js escucha resize de `window` (igual que map.js) para
  // recalcular tamaño/aspecto — eso no alcanza acá porque el tamaño real
  // que importa es el del contenedor .rampa-stage, no el de la ventana
  // (puede cambiar por layout — fuentes/imágenes terminando de cargar en
  // el resto de la página — sin que la ventana en sí cambie de tamaño).
  // Un ResizeObserver sobre el stage dispara un resize sintético para que
  // el listener existente de scene.js haga el recálculo sin tocar scene.js.
  if (stageEl && window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });
    ro.observe(stageEl);
  }

  // Deriva un nombre lindo ("Zona 2") a partir de la key del cluster
  // ("logozone_2") que arma logoZones.js. "logozone" a secas (sin número)
  // cae en el índice+1 como fallback.
  function zoneDisplayName(key, indexFallback) {
    const match = /logozone[_-]?(\d+)/i.exec(key || '');
    return `Zona ${match ? match[1] : indexFallback + 1}`;
  }

  /**
   * Modo LogoZone con 2+ zonas nombradas a mano: reemplaza el ciclado
   * genérico "Cambiar cara" por selección directa — un botón por zona.
   * Con 0 o 1 zona no hay nada que elegir, así que ambos controles quedan
   * ocultos (bindMeshes ya cayó a modo auto en ese caso).
   */
  function renderZonePicker() {
    if (!zonePickerControl || !zoneButtonsContainer) return;

    const showPicker = logoManager.usingZones && logoManager.clusters.length > 1;
    zonePickerControl.classList.toggle('hidden', !showPicker);
    faceControl?.classList.toggle('hidden', showPicker);

    if (!showPicker) {
      zoneButtonsContainer.innerHTML = '';
      return;
    }

    zoneButtonsContainer.innerHTML = '';
    logoManager.clusters.forEach((cluster, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'zone-btn';
      btn.classList.toggle('active', i === logoManager.activeClusterIndex);
      btn.textContent = zoneDisplayName(cluster.key, i);
      btn.addEventListener('click', () => {
        logoManager.applyCluster(i);
        renderZonePicker();
      });
      zoneButtonsContainer.appendChild(btn);
    });
  }

  function updateFaceLabel() {
    if (!faceLabel) return;
    const total = logoManager.clusters.length;
    if (total === 0) {
      faceLabel.textContent = 'Sin caras detectadas';
      btnFacePrev?.setAttribute('disabled', 'true');
      btnFaceNext?.setAttribute('disabled', 'true');
      return;
    }
    const modeTag = logoManager.usingZones ? ' · LogoZone' : ' · auto';
    faceLabel.textContent = `Cara ${logoManager.activeClusterIndex + 1} / ${total}${modeTag}`;
    const disable = total <= 1;
    btnFacePrev?.toggleAttribute('disabled', disable);
    btnFaceNext?.toggleAttribute('disabled', disable);
  }

  btnFacePrev?.addEventListener('click', () => {
    logoManager.prevCluster();
    updateFaceLabel();
  });

  btnFaceNext?.addEventListener('click', () => {
    logoManager.nextCluster();
    updateFaceLabel();
  });

  // La proyección UV no puede saber "para dónde es arriba" en la superficie
  // real de la rampa, así que la orientación final queda a ajuste manual.
  btnRotateLogo?.addEventListener('click', () => {
    logoManager.rotateLogo();
  });

  btnFlipH?.addEventListener('click', () => {
    logoManager.flipLogoHorizontal();
  });

  btnFlipV?.addEventListener('click', () => {
    logoManager.flipLogoVertical();
  });

  // --- Model picker ---

  function buildModelPicker() {
    if (!modelList) return;
    modelList.innerHTML = '';
    MODELS.forEach((config) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'model-item';
      btn.dataset.modelId = config.id;
      btn.innerHTML = `
        <span class="model-item-label">${config.label}</span>
        <span class="model-item-sub">${config.sublabel}</span>
      `;
      btn.addEventListener('click', () => selectModel(config.id));
      modelList.appendChild(btn);
    });
  }

  function setActiveModelUI(id) {
    const config = MODELS.find((m) => m.id === id);
    if (!config) return;

    modelList?.querySelectorAll('.model-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.modelId === id);
    });

    if (versionChip) versionChip.textContent = `${config.id}.glb`;
    if (loaderSub) loaderSub.textContent = `${config.id}.glb`;
  }

  function selectModel(id) {
    const config = MODELS.find((m) => m.id === id);
    if (!config || id === activeModelId) return;

    activeModelId = id;
    setActiveModelUI(id);
    loadingOverlay.classList.remove('fade-out');
    clearError();
    scene.loadModel(config.file);
  }

  // Init picker + carga el modelo default
  buildModelPicker();
  selectModel(DEFAULT_MODEL_ID);

  // UI Helpers
  function showError(msg) {
    errorMessage.textContent = msg;
    alertError.classList.remove('hidden');
  }

  function clearError() {
    alertError.classList.add('hidden');
  }

  function updateStatus(hasLogo, fileName = '') {
    if (hasLogo) {
      statusDot.classList.add('active');
      statusText.textContent = `Logo aplicado: ${fileName}`;
      btnRemoveLogo.classList.remove('hidden');
    } else {
      statusDot.classList.remove('active');
      statusText.textContent = 'Sin logo • Negro original';
      btnRemoveLogo.classList.add('hidden');
      alertNoTransparency.classList.add('hidden');
    }
  }

  function applyLoadedImage(img, fileName, previewUrl) {
    const result = logoManager.setLogo(img);

    logoThumbnail.src = previewUrl;
    fileNameEl.textContent = fileName;
    fileDimsEl.textContent = `${img.width} × ${img.height} px`;

    dropZoneIdle.classList.add('hidden');
    dropZoneActive.classList.remove('hidden');

    if (!result.hasTransparency) {
      alertNoTransparency.classList.remove('hidden');
    } else {
      alertNoTransparency.classList.add('hidden');
    }

    updateStatus(true, fileName);
  }

  function processImageFile(file) {
    clearError();

    if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) {
      showError('El archivo debe ser un PNG válido (.png).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();

      img.onload = () => {
        currentFile = file;
        applyLoadedImage(img, file.name, dataUrl);
      };

      img.onerror = () => {
        showError('No se pudo decodificar la imagen PNG.');
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      showError('Error al leer el archivo local.');
    };

    reader.readAsDataURL(file);
  }

  function resetToDefault() {
    currentFile = null;
    logoInput.value = '';
    logoManager.clearLogo();

    dropZoneIdle.classList.remove('hidden');
    dropZoneActive.classList.add('hidden');
    logoThumbnail.src = '';

    clearError();
    updateStatus(false);
  }

  // Event Listeners

  dropZone.addEventListener('click', (e) => {
    if (e.target === btnChangeFile) {
      logoInput.click();
      return;
    }
    if (dropZoneActive.classList.contains('hidden')) {
      logoInput.click();
    }
  });

  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logoInput.click();
    }
  });

  logoInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  });

  btnChangeFile.addEventListener('click', (e) => {
    e.stopPropagation();
    logoInput.click();
  });

  btnRemoveLogo.addEventListener('click', (e) => {
    e.stopPropagation();
    resetToDefault();
  });

  // Acotado a la sección (no a `window`) — ver comentario arriba.
  ['dragenter', 'dragover'].forEach((eventName) => {
    sectionRoot.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    sectionRoot.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  sectionRoot.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      processImageFile(dt.files[0]);
    }
  });

  // Paste: solo cuenta si el foco/selección está dentro de la sección (o
  // nada en particular está enfocado), para no interceptar un Ctrl+V que
  // el usuario hace en otra parte de la página.
  window.addEventListener('paste', (e) => {
    const active = document.activeElement;
    const pastingElsewhere = active && active !== document.body && !sectionRoot.contains(active);
    if (pastingElsewhere) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          processImageFile(blob);
          break;
        }
      }
    }
  });

  btnResetView.addEventListener('click', () => {
    if (scene) scene.resetCamera();
  });

  // Export instances to window for debugging/inspection
  window.__RAMP_APP = {
    scene,
    logoManager,
    get activeModelId() {
      return activeModelId;
    },
  };
}
