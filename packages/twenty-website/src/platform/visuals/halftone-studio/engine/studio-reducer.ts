import { normalizeHalftoneStudioSettings } from './normalize-studio-settings';
import {
  type HalftoneGeometrySpec,
  type HalftoneStudioAction,
  type HalftoneStudioState,
} from './studio-settings-types';

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

export function halftoneStudioReducer(
  state: HalftoneStudioState,
  action: HalftoneStudioAction,
): HalftoneStudioState {
  switch (action.type) {
    case 'setTab':
      return { ...state, activeTab: action.value };
    case 'setSourceMode':
      return {
        ...state,
        settings: { ...state.settings, sourceMode: action.value },
      };
    case 'setShapeKey':
      return {
        ...state,
        settings: { ...state.settings, shapeKey: action.value },
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
          lighting: { ...state.settings.lighting, ...action.value },
        },
      };
    case 'patchMaterial':
      return {
        ...state,
        settings: {
          ...state.settings,
          material: { ...state.settings.material, ...action.value },
        },
      };
    case 'patchHalftone':
      return {
        ...state,
        settings: {
          ...state.settings,
          halftone: { ...state.settings.halftone, ...action.value },
        },
      };
    case 'patchBackground':
      return {
        ...state,
        settings: {
          ...state.settings,
          background: { ...state.settings.background, ...action.value },
        },
      };
    case 'patchAnimation':
      return {
        ...state,
        settings: {
          ...state.settings,
          animation: { ...state.settings.animation, ...action.value },
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
          ? { ...state.settings, shapeKey: action.spec.key }
          : state.settings,
      };
    case 'setStatus':
      return {
        ...state,
        statusMessage: action.message,
        statusIsError: action.isError ?? false,
      };
    case 'clearStatus':
      return { ...state, statusMessage: '', statusIsError: false };
    case 'hideHint':
      return state.showHint ? { ...state, showHint: false } : state;
    default:
      return state;
  }
}
