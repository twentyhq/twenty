import { normalizeHalftoneStudioSettings } from './normalize-studio-settings';
import { HALFTONE_STUDIO_DEFAULTS } from './studio-settings-defaults';
import { type HalftoneStudioSettingsOverrides } from './studio-settings-types';

describe('halftone studio state defaults', () => {
  it('keeps the default scene aligned with the solid material preset', () => {
    expect(HALFTONE_STUDIO_DEFAULTS.settings.material.surface).toBe('solid');
    expect(HALFTONE_STUDIO_DEFAULTS.settings.lighting).toEqual(
      HALFTONE_STUDIO_DEFAULTS.solidLighting,
    );
    expect(HALFTONE_STUDIO_DEFAULTS.settings.animation).toEqual(
      HALFTONE_STUDIO_DEFAULTS.solidAnimation,
    );
  });

  it('fills missing nested fields from the selected solid surface defaults', () => {
    const normalized = normalizeHalftoneStudioSettings(
      JSON.parse(`{
        "material": { "surface": "solid" },
        "lighting": { "height": 4 },
        "animation": { "hoverReturn": false }
      }`) as HalftoneStudioSettingsOverrides,
    );

    expect(normalized.lighting).toEqual({
      ...HALFTONE_STUDIO_DEFAULTS.solidLighting,
      height: 4,
    });
    expect(normalized.animation).toEqual({
      ...HALFTONE_STUDIO_DEFAULTS.solidAnimation,
      hoverReturn: false,
    });
  });

  it('fills missing nested fields from the selected glass surface defaults', () => {
    const normalized = normalizeHalftoneStudioSettings(
      JSON.parse(`{
        "material": { "surface": "glass" },
        "lighting": { "height": 4 },
        "animation": { "hoverReturn": false }
      }`) as HalftoneStudioSettingsOverrides,
    );

    expect(normalized.lighting).toEqual({
      ...HALFTONE_STUDIO_DEFAULTS.glassLighting,
      height: 4,
    });
    expect(normalized.animation).toEqual({
      ...HALFTONE_STUDIO_DEFAULTS.glassAnimation,
      hoverReturn: false,
    });
  });

  it('backfills the hover dash color when older presets do not include it', () => {
    const normalized = normalizeHalftoneStudioSettings(
      JSON.parse(`{
        "sourceMode": "image",
        "halftone": {
          "enabled": true,
          "scale": 24.72,
          "power": -0.07,
          "width": 0.46,
          "imageContrast": 1,
          "dashColor": "#112233"
        }
      }`) as HalftoneStudioSettingsOverrides,
    );

    expect(normalized.halftone.dashColor).toBe('#112233');
    expect(normalized.halftone.hoverDashColor).toBe(
      HALFTONE_STUDIO_DEFAULTS.settings.halftone.hoverDashColor,
    );
    expect(normalized.halftone.toneTarget).toBe(
      HALFTONE_STUDIO_DEFAULTS.settings.halftone.toneTarget,
    );
  });

  it('preserves a dark-area halftone target from newer presets', () => {
    const normalized = normalizeHalftoneStudioSettings(
      JSON.parse(`{
        "halftone": {
          "enabled": true,
          "scale": 24.72,
          "power": -0.07,
          "toneTarget": "dark",
          "width": 0.46,
          "imageContrast": 1,
          "dashColor": "#112233",
          "hoverDashColor": "#445566"
        }
      }`) as HalftoneStudioSettingsOverrides,
    );

    expect(normalized.halftone.toneTarget).toBe('dark');
  });
});
