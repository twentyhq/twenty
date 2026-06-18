import {
  type HalftoneAnimationSettings,
  type HalftoneBackgroundSettings,
  type HalftoneEffectSettings,
  type HalftoneGeometrySpec,
  type HalftoneLightingSettings,
  type HalftoneMaterialSettings,
  type HalftoneStudioSettings,
} from './studio-settings-types';

const GEOMETRY_SPECS: HalftoneGeometrySpec[] = [
  { key: 'torusKnot', label: 'Torus Knot', kind: 'builtin' },
  { key: 'sphere', label: 'Sphere', kind: 'builtin' },
  { key: 'torus', label: 'Torus', kind: 'builtin' },
  { key: 'icosahedron', label: 'Icosahedron', kind: 'builtin' },
  { key: 'box', label: 'Box', kind: 'builtin' },
  { key: 'cone', label: 'Cone', kind: 'builtin' },
  { key: 'cylinder', label: 'Cylinder', kind: 'builtin' },
  { key: 'octahedron', label: 'Octahedron', kind: 'builtin' },
  { key: 'dodecahedron', label: 'Dodecahedron', kind: 'builtin' },
  { key: 'tetrahedron', label: 'Tetrahedron', kind: 'builtin' },
  { key: 'sunCoin', label: 'Sun Coin', kind: 'builtin' },
  { key: 'lotusCoin', label: 'Lotus Coin', kind: 'builtin' },
  { key: 'arrowTarget', label: 'Arrow Target', kind: 'builtin' },
  { key: 'dollarCoin', label: 'Dollar Coin', kind: 'builtin' },
];

const SHAPE_HALFTONE: HalftoneEffectSettings = {
  enabled: true,
  scale: 24.72,
  power: -0.07,
  toneTarget: 'light',
  width: 0.46,
  imageContrast: 1,
  dashColor: '#4A38F5',
  hoverDashColor: '#4A38F5',
};

const IMAGE_HALFTONE: HalftoneEffectSettings = {
  enabled: true,
  scale: 24.72,
  power: -0.07,
  toneTarget: 'light',
  width: 0.46,
  imageContrast: 1,
  dashColor: '#4A38F5',
  hoverDashColor: '#4A38F5',
};

const SOLID_MATERIAL: HalftoneMaterialSettings = {
  surface: 'solid',
  color: '#d4d0c8',
  roughness: 0.42,
  metalness: 0.16,
  thickness: 150,
  refraction: 2,
  environmentPower: 5,
};

const GLASS_MATERIAL: HalftoneMaterialSettings = {
  surface: 'glass',
  color: '#7d7d7d',
  roughness: 0,
  metalness: 0,
  thickness: 15.58,
  refraction: 2,
  environmentPower: 5,
};

// The old preset shape (roughness/metalness 0.1) that normalize snaps back to
// the current glass default when matched.
const LEGACY_GLASS_MATERIAL: HalftoneMaterialSettings = {
  surface: 'glass',
  color: '#7d7d7d',
  roughness: 0.1,
  metalness: 0.1,
  thickness: 150,
  refraction: 2,
  environmentPower: 5,
};

const SOLID_LIGHTING: HalftoneLightingSettings = {
  intensity: 1.5,
  fillIntensity: 0.15,
  ambientIntensity: 0.08,
  angleDegrees: 45,
  height: 2,
};

const GLASS_LIGHTING: HalftoneLightingSettings = {
  intensity: 3,
  fillIntensity: 0,
  ambientIntensity: 0.3,
  angleDegrees: 53,
  height: 2,
};

const SOLID_BACKGROUND: HalftoneBackgroundSettings = {
  transparent: true,
  color: '#000000',
};

const GLASS_BACKGROUND: HalftoneBackgroundSettings = {
  transparent: true,
  color: '#000000',
};

const SOLID_ANIMATION: HalftoneAnimationSettings = {
  autoRotateEnabled: true,
  breatheEnabled: false,
  cameraParallaxEnabled: false,
  followHoverEnabled: false,
  followDragEnabled: false,
  floatEnabled: false,
  hoverHalftoneEnabled: false,
  hoverLightEnabled: false,
  dragFlowEnabled: false,
  lightSweepEnabled: false,
  rotateEnabled: false,
  autoSpeed: 0.2,
  autoWobble: 0.3,
  breatheAmount: 0.04,
  breatheSpeed: 0.8,
  cameraParallaxAmount: 0.3,
  cameraParallaxEase: 0.08,
  driftAmount: 8,
  hoverRange: 25,
  hoverEase: 0.08,
  hoverReturn: true,
  dragSens: 0.008,
  dragFriction: 0.08,
  dragMomentum: true,
  rotateAxis: 'y',
  rotatePreset: 'axis',
  rotateSpeed: 0.2,
  rotatePingPong: false,
  floatAmplitude: 0.16,
  floatSpeed: 0.8,
  lightSweepHeightRange: 0.5,
  lightSweepRange: 28,
  lightSweepSpeed: 0.7,
  springDamping: 0.72,
  springReturnEnabled: false,
  springStrength: 0.18,
  hoverHalftonePowerShift: 0.42,
  hoverHalftoneRadius: 0.2,
  hoverHalftoneWidthShift: -0.18,
  hoverLightIntensity: 0.8,
  hoverLightRadius: 0.2,
  dragFlowDecay: 0.08,
  dragFlowRadius: 0.24,
  dragFlowStrength: 1.8,
  hoverWarpStrength: 3,
  hoverWarpRadius: 0.15,
  dragWarpStrength: 5,
  waveEnabled: false,
  waveSpeed: 1,
  waveAmount: 2,
};

const GLASS_ANIMATION: HalftoneAnimationSettings = {
  ...SOLID_ANIMATION,
  followDragEnabled: true,
  autoSpeed: 0.15,
  rotateSpeed: 0.1,
};

const SETTINGS: HalftoneStudioSettings = {
  sourceMode: 'shape',
  shapeKey: 'torusKnot',
  lighting: { ...SOLID_LIGHTING },
  material: { ...SOLID_MATERIAL },
  halftone: SHAPE_HALFTONE,
  background: { ...SOLID_BACKGROUND },
  animation: { ...SOLID_ANIMATION },
};

// Every default the studio settings model draws on, in one place.
export const HALFTONE_STUDIO_DEFAULTS = {
  geometrySpecs: GEOMETRY_SPECS,
  shapeHalftone: SHAPE_HALFTONE,
  imageHalftone: IMAGE_HALFTONE,
  solidMaterial: SOLID_MATERIAL,
  glassMaterial: GLASS_MATERIAL,
  legacyGlassMaterial: LEGACY_GLASS_MATERIAL,
  solidLighting: SOLID_LIGHTING,
  glassLighting: GLASS_LIGHTING,
  solidBackground: SOLID_BACKGROUND,
  glassBackground: GLASS_BACKGROUND,
  solidAnimation: SOLID_ANIMATION,
  glassAnimation: GLASS_ANIMATION,
  settings: SETTINGS,
};
