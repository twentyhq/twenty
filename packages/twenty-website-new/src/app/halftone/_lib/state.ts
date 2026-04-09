import type {
  HalftoneGeometrySpec,
  HalftoneSourceMode,
  HalftoneStudioAction,
  HalftoneStudioSettings,
  HalftoneStudioState,
} from './types';

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

export const DEFAULT_IMAGE_HALFTONE_SETTINGS: Partial<HalftoneStudioSettings> =
  {
    halftone: {
      enabled: true,
      numRows: 80,
      contrast: 1.5,
      power: 1.2,
      shading: 0.8,
      baseInk: 0.08,
      maxBar: 0.32,
      cellRatio: 2.0,
      cutoff: 0.02,
      dashColor: '#4A38F5',
    },
  };

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
  halftone: {
    enabled: true,
    numRows: 45,
    contrast: 1.3,
    power: 1.1,
    shading: 1.6,
    baseInk: 0.16,
    maxBar: 0.24,
    cellRatio: 2.2,
    cutoff: 0.02,
    dashColor: '#4A38F5',
  },
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

export function createInitialHalftoneStudioState(): HalftoneStudioState {
  return {
    activeTab: 'design',
    geometrySpecs: [...DEFAULT_GEOMETRY_SPECS],
    importedFiles: {},
    settings: DEFAULT_HALFTONE_SETTINGS,
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
        settings: action.value,
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
