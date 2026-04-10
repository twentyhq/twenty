type HalftoneTabId = 'design' | 'animations' | 'export';
type HalftoneSourceMode = 'shape' | 'image';
type HalftoneRotateAxis = 'x' | 'y' | 'z' | 'xy' | '-x' | '-y' | '-z' | '-xy';
type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';
type HalftoneModelLoader = 'fbx' | 'glb';

interface HalftoneLightingSettings {
  intensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  angleDegrees: number;
  height: number;
}

interface HalftoneMaterialSettings {
  roughness: number;
  metalness: number;
}

interface HalftoneEffectSettings {
  enabled: boolean;
  numRows: number;
  contrast: number;
  power: number;
  shading: number;
  baseInk: number;
  maxBar: number;
  rowMerge: number;
  cellRatio: number;
  cutoff: number;
  highlightOpen: number;
  shadowGrouping: number;
  shadowCrush: number;
  dashColor: string;
}

interface HalftoneBackgroundSettings {
  transparent: boolean;
  color: string;
}

interface HalftoneAnimationSettings {
  autoRotateEnabled: boolean;
  breatheEnabled: boolean;
  cameraParallaxEnabled: boolean;
  followHoverEnabled: boolean;
  followDragEnabled: boolean;
  floatEnabled: boolean;
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

interface HalftoneStudioSettings {
  sourceMode: HalftoneSourceMode;
  shapeKey: string;
  lighting: HalftoneLightingSettings;
  material: HalftoneMaterialSettings;
  halftone: HalftoneEffectSettings;
  background: HalftoneBackgroundSettings;
  animation: HalftoneAnimationSettings;
}

interface HalftoneGeometrySpec {
  key: string;
  label: string;
  kind: 'builtin' | 'imported';
  loader?: HalftoneModelLoader;
  filename?: string;
  description?: string;
  extensions?: readonly string[];
  userProvided?: boolean;
}

interface HalftoneStudioState {
  activeTab: HalftoneTabId;
  geometrySpecs: HalftoneGeometrySpec[];
  importedFiles: Record<string, File>;
  settings: HalftoneStudioSettings;
  showHint: boolean;
  statusMessage: string;
  statusIsError: boolean;
}

type HalftoneStudioAction =
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
  | { type: 'setImportedFile'; key: string; file: File }
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
  {
    key: 'wheel',
    label: 'Wheel.fbx',
    kind: 'imported',
    loader: 'fbx',
    filename: 'Wheel.fbx',
    description: 'FBX model',
    extensions: ['.fbx'],
  },
  {
    key: 'twoGlb',
    label: 'two.glb',
    kind: 'imported',
    loader: 'glb',
    filename: 'two.glb',
    description: 'GLB model',
    extensions: ['.glb'],
  },
];

export const DEFAULT_SHAPE_HALFTONE_SETTINGS: HalftoneEffectSettings = {
  enabled: true,
  numRows: 45,
  contrast: 1.3,
  power: 1.1,
  shading: 1.6,
  baseInk: 0.12,
  maxBar: 0.24,
  rowMerge: 0.06,
  cellRatio: 2.2,
  cutoff: 0.02,
  highlightOpen: 0.05,
  shadowGrouping: 0.18,
  shadowCrush: 0.14,
  dashColor: '#4A38F5',
};

export const DEFAULT_IMAGE_HALFTONE_SETTINGS: HalftoneEffectSettings = {
  enabled: true,
  numRows: 80,
  contrast: 1.5,
  power: 1.2,
  shading: 0.8,
  baseInk: 0.06,
  maxBar: 0.32,
  rowMerge: 0.18,
  cellRatio: 2.0,
  cutoff: 0.02,
  highlightOpen: 0.14,
  shadowGrouping: 0.38,
  shadowCrush: 0.24,
  dashColor: '#4A38F5',
};

export function getDefaultHalftoneSettings(sourceMode: HalftoneSourceMode) {
  return sourceMode === 'image'
    ? DEFAULT_IMAGE_HALFTONE_SETTINGS
    : DEFAULT_SHAPE_HALFTONE_SETTINGS;
}

export const DEFAULT_HALFTONE_SETTINGS: HalftoneStudioSettings = {
  sourceMode: 'shape' as HalftoneSourceMode,
  shapeKey: 'torusKnot',
  lighting: {
    intensity: 1.5,
    fillIntensity: 0.15,
    ambientIntensity: 0.08,
    angleDegrees: 45,
    height: 2,
  },
  material: {
    roughness: 0.42,
    metalness: 0.16,
  },
  halftone: DEFAULT_SHAPE_HALFTONE_SETTINGS,
  background: {
    transparent: true,
    color: '#ffffff',
  },
  animation: {
    autoRotateEnabled: true,
    breatheEnabled: false,
    cameraParallaxEnabled: false,
    followHoverEnabled: false,
    followDragEnabled: false,
    floatEnabled: false,
    hoverLightEnabled: false,
    dragFlowEnabled: false,
    lightSweepEnabled: false,
    rotateEnabled: false,
    autoSpeed: 0.3,
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
    rotateSpeed: 1,
    rotatePingPong: false,
    floatAmplitude: 0.16,
    floatSpeed: 0.8,
    lightSweepHeightRange: 0.5,
    lightSweepRange: 28,
    lightSweepSpeed: 0.7,
    springDamping: 0.72,
    springReturnEnabled: false,
    springStrength: 0.18,
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
  },
};

export function normalizeHalftoneStudioSettings(
  settings?: Partial<HalftoneStudioSettings>,
): HalftoneStudioSettings {
  const sourceMode =
    settings?.sourceMode ?? DEFAULT_HALFTONE_SETTINGS.sourceMode;

  return {
    ...DEFAULT_HALFTONE_SETTINGS,
    ...settings,
    sourceMode,
    lighting: {
      ...DEFAULT_HALFTONE_SETTINGS.lighting,
      ...settings?.lighting,
    },
    material: {
      ...DEFAULT_HALFTONE_SETTINGS.material,
      ...settings?.material,
    },
    halftone: {
      ...getDefaultHalftoneSettings(sourceMode),
      ...settings?.halftone,
    },
    background: {
      ...DEFAULT_HALFTONE_SETTINGS.background,
      ...settings?.background,
    },
    animation: {
      ...DEFAULT_HALFTONE_SETTINGS.animation,
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
    case 'setImportedFile':
      return {
        ...state,
        importedFiles: {
          ...state.importedFiles,
          [action.key]: action.file,
        },
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
