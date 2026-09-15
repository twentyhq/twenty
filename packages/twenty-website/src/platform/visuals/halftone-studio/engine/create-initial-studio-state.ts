import { normalizeHalftoneStudioSettings } from './normalize-studio-settings';
import { HALFTONE_STUDIO_DEFAULTS } from './studio-settings-defaults';
import { type HalftoneStudioState } from './studio-settings-types';

export function createInitialHalftoneStudioState(): HalftoneStudioState {
  return {
    activeTab: 'design',
    geometrySpecs: [...HALFTONE_STUDIO_DEFAULTS.geometrySpecs],
    importedFiles: {},
    settings: normalizeHalftoneStudioSettings(
      HALFTONE_STUDIO_DEFAULTS.settings,
    ),
    showHint: true,
    statusMessage: '',
    statusIsError: false,
  };
}
