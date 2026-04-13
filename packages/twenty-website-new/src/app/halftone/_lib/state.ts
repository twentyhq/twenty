export type HalftoneTabId = 'design' | 'animations' | 'export';
export type HalftoneSourceMode = 'shape' | 'image';
export type HalftoneMaterialSurface = 'solid' | 'glass';
export type HalftoneRotateAxis =
  | 'x'
  | 'y'
  | 'z'
  | 'xy'
  | '-x'
  | '-y'
  | '-z'
  | '-xy';
export type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';
export type HalftoneModelLoader = 'fbx' | 'glb';

export interface HalftoneLightingSettings {
  intensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  angleDegrees: number;
  height: number;
}

export interface HalftoneMaterialSettings {
  surface: HalftoneMaterialSurface;
  color: string;
  roughness: number;
  metalness: number;
  thickness: number;
  refraction: number;
  environmentPower: number;
}

export interface HalftoneEffectSettings {
  enabled: boolean;
  scale: number;
  power: number;
  width: number;
  imageContrast: number;
  dashColor: string;
  hoverDashColor: string;
}

export interface HalftoneBackgroundSettings {
  transparent: boolean;
  color: string;
}

export interface HalftoneAnimationSettings {
  autoRotateEnabled: boolean;
  breatheEnabled: boolean;
  cameraParallaxEnabled: boolean;
  followHoverEnabled: boolean;
  followDragEnabled: boolean;
  floatEnabled: boolean;
  hoverHalftoneEnabled: boolean;
  hoverLightEnabled: boolean;
  dragFlowEnabled: boolean;
  lightSweepEnabled: boolean;
  rotateEnabled: boolean;
  autoSpeed: number;
  autoWobble: number;
  breatheAmount: number;
  breatheSpeed: number;
  cameraParallaxAmount: number;
  cameraParallaxEase: number;
  driftAmount: number;
  hoverRange: number;
  hoverEase: number;
  hoverReturn: boolean;
  dragSens: number;
  dragFriction: number;
  dragMomentum: boolean;
  rotateAxis: HalftoneRotateAxis;
  rotatePreset: HalftoneRotatePreset;
  rotateSpeed: number;
  rotatePingPong: boolean;
  floatAmplitude: number;
  floatSpeed: number;
  lightSweepHeightRange: number;
  lightSweepRange: number;
  lightSweepSpeed: number;
  springDamping: number;
  springReturnEnabled: boolean;
  springStrength: number;
  hoverHalftonePowerShift: number;
  hoverHalftoneRadius: number;
  hoverHalftoneWidthShift: number;
  hoverLightIntensity: number;
  hoverLightRadius: number;
  dragFlowDecay: number;
  dragFlowRadius: number;
  dragFlowStrength: number;
  hoverWarpStrength: number;
  hoverWarpRadius: number;
  dragWarpStrength: number;
  waveEnabled: boolean;
  waveSpeed: number;
  waveAmount: number;
}

export interface HalftoneStudioSettings {
  sourceMode: HalftoneSourceMode;
  shapeKey: string;
  lighting: HalftoneLightingSettings;
  material: HalftoneMaterialSettings;
  halftone: HalftoneEffectSettings;
  background: HalftoneBackgroundSettings;
  animation: HalftoneAnimationSettings;
}

export interface HalftoneGeometrySpec {
  key: string;
  label: string;
  kind: 'builtin' | 'imported';
  loader?: HalftoneModelLoader;
  filename?: string;
  description?: string;
  extensions?: readonly string[];
  userProvided?: boolean;
}

export interface HalftoneStudioState {
  activeTab: HalftoneTabId;
  geometrySpecs: HalftoneGeometrySpec[];
  importedFiles: Record<string, File>;
  settings: HalftoneStudioSettings;
  showHint: boolean;
  statusMessage: string;
  statusIsError: boolean;
}

export interface HalftoneExportPose {
  autoElapsed: number;
  rotateElapsed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  targetRotationX: number;
  targetRotationY: number;
  timeElapsed: number;
}

export type HalftoneStudioAction =
  | { type: 'setTab'; value: HalftoneTabId }
  | { type: 'setSourceMode'; value: HalftoneSourceMode }
  | { type: 'setShapeKey'; value: string }
  | { type: 'replaceSettings'; value: HalftoneStudioSettings }
  | { type: 'patchLighting'; value: Partial<HalftoneLightingSettings> }
  | { type: 'patchMaterial'; value: Partial<HalftoneMaterialSettings> }
  | { type: 'patchHalftone'; value: Partial<HalftoneEffectSettings> }
  | { type: 'patchBackground'; value: Partial<HalftoneBackgroundSettings> }
  | { type: 'patchAnimation'; value: Partial<HalftoneAnimationSettings> }
  | {
      type: 'registerImportedFile';
      spec: HalftoneGeometrySpec;
      file: File;
      activate: boolean;
    }
  | { type: 'setStatus'; message: string; isError?: boolean }
  | { type: 'clearStatus' }
  | { type: 'hideHint' };

function upsertGeometrySpec(
  geometrySpecs: HalftoneGeometrySpec[],
  spec: HalftoneGeometrySpec,
) {
  const existingIndex = geometrySpecs.findIndex(
    (geometrySpec) => geometrySpec.key === spec.key,
  );

  if (existingIndex === -1) {
    return [...geometrySpecs, spec];
  }

  return geometrySpecs.map((geometrySpec, index) =>
    index === existingIndex ? spec : geometrySpec,
  );
}

export const DEFAULT_GEOMETRY_SPECS: HalftoneGeometrySpec[] = [
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

export const DEFAULT_SHAPE_HALFTONE_SETTINGS: HalftoneEffectSettings = {
  enabled: true,
  scale: 24.72,
  power: -0.07,
  width: 0.46,
  imageContrast: 1,
  dashColor: '#4A38F5',
  hoverDashColor: '#4A38F5',
};

export const DEFAULT_IMAGE_HALFTONE_SETTINGS: HalftoneEffectSettings = {
  enabled: true,
  scale: 24.72,
  power: -0.07,
  width: 0.46,
  imageContrast: 1,
  dashColor: '#4A38F5',
  hoverDashColor: '#4A38F5',
};

export const DEFAULT_SOLID_MATERIAL_SETTINGS: HalftoneMaterialSettings = {
  surface: 'solid',
  color: '#d4d0c8',
  roughness: 0.42,
  metalness: 0.16,
  thickness: 150,
  refraction: 2,
  environmentPower: 5,
};

export const DEFAULT_GLASS_MATERIAL_SETTINGS: HalftoneMaterialSettings = {
  surface: 'glass',
  color: '#7d7d7d',
  roughness: 0,
  metalness: 0,
  thickness: 15.58,
  refraction: 2,
  environmentPower: 5,
};

export const DEFAULT_SOLID_LIGHTING_SETTINGS: HalftoneLightingSettings = {
  intensity: 1.5,
  fillIntensity: 0.15,
  ambientIntensity: 0.08,
  angleDegrees: 45,
  height: 2,
};

export const DEFAULT_GLASS_LIGHTING_SETTINGS: HalftoneLightingSettings = {
  intensity: 3,
  fillIntensity: 0,
  ambientIntensity: 0.3,
  angleDegrees: 53,
  height: 2,
};

export const DEFAULT_SOLID_BACKGROUND_SETTINGS: HalftoneBackgroundSettings = {
  transparent: true,
  color: '#000000',
};

export const DEFAULT_GLASS_BACKGROUND_SETTINGS: HalftoneBackgroundSettings = {
  transparent: true,
  color: '#000000',
};

function getDefaultLightingSettings(
  surface: HalftoneMaterialSurface,
): HalftoneLightingSettings {
  return surface === 'glass'
    ? DEFAULT_GLASS_LIGHTING_SETTINGS
    : DEFAULT_SOLID_LIGHTING_SETTINGS;
}

function getDefaultBackgroundSettings(
  surface: HalftoneMaterialSurface,
): HalftoneBackgroundSettings {
  return surface === 'glass'
    ? DEFAULT_GLASS_BACKGROUND_SETTINGS
    : DEFAULT_SOLID_BACKGROUND_SETTINGS;
}

export const DEFAULT_SOLID_ANIMATION_SETTINGS: HalftoneAnimationSettings = {
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

export const DEFAULT_GLASS_ANIMATION_SETTINGS: HalftoneAnimationSettings = {
  autoRotateEnabled: true,
  breatheEnabled: false,
  cameraParallaxEnabled: false,
  followHoverEnabled: false,
  followDragEnabled: true,
  floatEnabled: false,
  hoverHalftoneEnabled: false,
  hoverLightEnabled: false,
  dragFlowEnabled: false,
  lightSweepEnabled: false,
  rotateEnabled: false,
  autoSpeed: 0.15,
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
  rotateSpeed: 0.1,
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

function getDefaultAnimationSettings(
  surface: HalftoneMaterialSurface,
): HalftoneAnimationSettings {
  return surface === 'glass'
    ? DEFAULT_GLASS_ANIMATION_SETTINGS
    : DEFAULT_SOLID_ANIMATION_SETTINGS;
}

export const LEGACY_HALFTONE_SETTING_KEYS = [
  'numRows',
  'contrast',
  'shading',
  'baseInk',
  'maxBar',
  'rowMerge',
  'cellRatio',
  'cutoff',
  'highlightOpen',
  'shadowGrouping',
  'shadowCrush',
] as const;

export function isRoundedBandHalftoneSettings(
  value: unknown,
): value is Omit<HalftoneEffectSettings, 'hoverDashColor'> & {
  hoverDashColor?: string;
} {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.enabled === 'boolean' &&
    typeof candidate.scale === 'number' &&
    typeof candidate.power === 'number' &&
    typeof candidate.width === 'number' &&
    typeof candidate.imageContrast === 'number' &&
    typeof candidate.dashColor === 'string' &&
    (typeof candidate.hoverDashColor === 'string' ||
      typeof candidate.hoverDashColor === 'undefined')
  );
}

export function getDefaultHalftoneSettings(sourceMode: HalftoneSourceMode) {
  return sourceMode === 'image'
    ? DEFAULT_IMAGE_HALFTONE_SETTINGS
    : DEFAULT_SHAPE_HALFTONE_SETTINGS;
}

function normalizeHalftoneEffectSettings(
  defaults: HalftoneEffectSettings,
  settings?: Partial<HalftoneEffectSettings>,
): HalftoneEffectSettings {
  return {
    enabled: settings?.enabled ?? defaults.enabled,
    scale: settings?.scale ?? defaults.scale,
    power: settings?.power ?? defaults.power,
    width: settings?.width ?? defaults.width,
    imageContrast: settings?.imageContrast ?? defaults.imageContrast,
    dashColor: settings?.dashColor ?? defaults.dashColor,
    hoverDashColor: settings?.hoverDashColor ?? defaults.hoverDashColor,
  };
}

function normalizeMaterialSettings(
  settings?: Partial<HalftoneMaterialSettings>,
): HalftoneMaterialSettings {
  const surface = settings?.surface === 'glass' ? 'glass' : 'solid';
  const defaults =
    surface === 'glass'
      ? DEFAULT_GLASS_MATERIAL_SETTINGS
      : DEFAULT_SOLID_MATERIAL_SETTINGS;

  return {
    surface,
    color:
      typeof settings?.color === 'string' ? settings.color : defaults.color,
    roughness:
      typeof settings?.roughness === 'number'
        ? settings.roughness
        : defaults.roughness,
    metalness:
      typeof settings?.metalness === 'number'
        ? settings.metalness
        : defaults.metalness,
    thickness:
      typeof settings?.thickness === 'number'
        ? settings.thickness
        : defaults.thickness,
    refraction:
      typeof settings?.refraction === 'number'
        ? settings.refraction
        : defaults.refraction,
    environmentPower:
      typeof settings?.environmentPower === 'number'
        ? settings.environmentPower
        : defaults.environmentPower,
  };
}

export const DEFAULT_HALFTONE_SETTINGS: HalftoneStudioSettings = {
  sourceMode: 'shape' as HalftoneSourceMode,
  shapeKey: 'torusKnot',
  lighting: { ...DEFAULT_SOLID_LIGHTING_SETTINGS },
  material: {
    ...DEFAULT_SOLID_MATERIAL_SETTINGS,
  },
  halftone: DEFAULT_SHAPE_HALFTONE_SETTINGS,
  background: { ...DEFAULT_SOLID_BACKGROUND_SETTINGS },
  animation: { ...DEFAULT_SOLID_ANIMATION_SETTINGS },
};

const LEGACY_GLASS_MATERIAL_SETTINGS: HalftoneMaterialSettings = {
  surface: 'glass',
  color: '#7d7d7d',
  roughness: 0.1,
  metalness: 0.1,
  thickness: 150,
  refraction: 2,
  environmentPower: 5,
};

function materialMatches(
  value: Partial<HalftoneMaterialSettings> | undefined,
  target: HalftoneMaterialSettings,
) {
  return (
    value?.surface === target.surface &&
    value?.color === target.color &&
    value?.roughness === target.roughness &&
    value?.metalness === target.metalness &&
    value?.thickness === target.thickness &&
    value?.refraction === target.refraction &&
    value?.environmentPower === target.environmentPower
  );
}

export function normalizeHalftoneStudioSettings(
  settings?: Partial<HalftoneStudioSettings>,
): HalftoneStudioSettings {
  const sourceMode =
    settings?.sourceMode ?? DEFAULT_HALFTONE_SETTINGS.sourceMode;
  const mergedMaterial = normalizeMaterialSettings(settings?.material);
  const material =
    mergedMaterial.surface === 'glass' &&
    materialMatches(settings?.material, LEGACY_GLASS_MATERIAL_SETTINGS)
      ? { ...DEFAULT_GLASS_MATERIAL_SETTINGS }
      : mergedMaterial;
  const lightingDefaults = getDefaultLightingSettings(material.surface);
  const backgroundDefaults = getDefaultBackgroundSettings(material.surface);
  const animationDefaults = getDefaultAnimationSettings(material.surface);

  return {
    ...DEFAULT_HALFTONE_SETTINGS,
    ...settings,
    sourceMode,
    lighting: {
      ...lightingDefaults,
      ...settings?.lighting,
    },
    material,
    halftone: normalizeHalftoneEffectSettings(
      getDefaultHalftoneSettings(sourceMode),
      settings?.halftone,
    ),
    background: {
      ...backgroundDefaults,
      ...settings?.background,
    },
    animation: {
      ...animationDefaults,
      ...settings?.animation,
    },
  };
}

export function createInitialHalftoneStudioState(): HalftoneStudioState {
  return {
    activeTab: 'design',
    geometrySpecs: [...DEFAULT_GEOMETRY_SPECS],
    importedFiles: {},
    settings: normalizeHalftoneStudioSettings(DEFAULT_HALFTONE_SETTINGS),
    showHint: true,
    statusMessage: '',
    statusIsError: false,
  };
}

export function halftoneStudioReducer(
  state: HalftoneStudioState,
  action: HalftoneStudioAction,
): HalftoneStudioState {
  switch (action.type) {
    case 'setTab':
      return {
        ...state,
        activeTab: action.value,
      };
    case 'setSourceMode':
      return {
        ...state,
        settings: {
          ...state.settings,
          sourceMode: action.value,
        },
      };
    case 'setShapeKey':
      return {
        ...state,
        settings: {
          ...state.settings,
          shapeKey: action.value,
        },
      };
    case 'replaceSettings':
      return {
        ...state,
        settings: normalizeHalftoneStudioSettings(action.value),
      };
    case 'patchLighting':
      return {
        ...state,
        settings: {
          ...state.settings,
          lighting: {
            ...state.settings.lighting,
            ...action.value,
          },
        },
      };
    case 'patchMaterial':
      return {
        ...state,
        settings: {
          ...state.settings,
          material: {
            ...state.settings.material,
            ...action.value,
          },
        },
      };
    case 'patchHalftone':
      return {
        ...state,
        settings: {
          ...state.settings,
          halftone: {
            ...state.settings.halftone,
            ...action.value,
          },
        },
      };
    case 'patchBackground':
      return {
        ...state,
        settings: {
          ...state.settings,
          background: {
            ...state.settings.background,
            ...action.value,
          },
        },
      };
    case 'patchAnimation':
      return {
        ...state,
        settings: {
          ...state.settings,
          animation: {
            ...state.settings.animation,
            ...action.value,
          },
        },
      };
    case 'registerImportedFile':
      return {
        ...state,
        geometrySpecs: action.spec.userProvided
          ? upsertGeometrySpec(state.geometrySpecs, action.spec)
          : state.geometrySpecs,
        importedFiles: {
          ...state.importedFiles,
          [action.spec.key]: action.file,
        },
        settings: action.activate
          ? {
              ...state.settings,
              shapeKey: action.spec.key,
            }
          : state.settings,
      };
    case 'setStatus':
      return {
        ...state,
        statusMessage: action.message,
        statusIsError: action.isError ?? false,
      };
    case 'clearStatus':
      return {
        ...state,
        statusMessage: '',
        statusIsError: false,
      };
    case 'hideHint':
      return state.showHint
        ? {
            ...state,
            showHint: false,
          }
        : state;
    default:
      return state;
  }
}
