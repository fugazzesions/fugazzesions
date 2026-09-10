/**
 * Config declarativo de los 8 modelos de rampa (obstáculos reales de Fugazzesions #3).
 *
 * Ya no hace falta declarar acá qué sub-mesh es la cara target: logoDecal.js
 * detecta automáticamente los grupos de fragmentos que forman una misma cara
 * física (por cercanía real de sus cajas delimitadoras) y elige por default
 * la de mayor área. Si esa no es la correcta, el botón "Cambiar cara" de la
 * UI cicla entre las demás caras detectadas de ese modelo.
 */
export const MODELS = [
  { id: 'spot1', label: 'Spot 1', sublabel: 'Rampa banco', file: '/assets/ramp/spot1.glb' },
  { id: 'spot2', label: 'Spot 2', sublabel: 'Quarter pipe', file: '/assets/ramp/spot2.glb' },
  { id: 'spot3', label: 'Spot 3', sublabel: 'Escalera con baranda', file: '/assets/ramp/spot3.glb' },
  { id: 'spot4', label: 'Spot 4', sublabel: 'Stair bash', file: '/assets/ramp/spot4.glb' },
  { id: 'spot5', label: 'Spot 5', sublabel: 'Banco liso', file: '/assets/ramp/spot5.glb' },
  { id: 'spot6', label: 'Spot 6', sublabel: 'Cajón (ataúd)', file: '/assets/ramp/spot6.glb' },
  { id: 'spot7', label: 'Spot 7', sublabel: 'Obstáculo en punta', file: '/assets/ramp/spot7.glb' },
  { id: 'spot8', label: 'Spot 8', sublabel: 'Rampa curva (lomo)', file: '/assets/ramp/spot8.glb' },
];

export const DEFAULT_MODEL_ID = 'spot5';
