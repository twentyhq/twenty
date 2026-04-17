import {
  DEFAULT_GLASS_ANIMATION_SETTINGS,
  DEFAULT_GLASS_LIGHTING_SETTINGS,
  DEFAULT_HALFTONE_SETTINGS,
  DEFAULT_SOLID_ANIMATION_SETTINGS,
  DEFAULT_SOLID_LIGHTING_SETTINGS,
  normalizeHalftoneStudioSettings,
  type HalftoneStudioSettings,
} from '@/app/halftone/_lib/state';

describe('halftone studio state defaults', () => {
  it('keeps the default scene aligned with the solid material preset', () => {
    expect(DEFAULT_HALFTONE_SETTINGS.material.surface).toBe('solid');
    expect(DEFAULT_HALFTONE_SETTINGS.lighting).toEqual(
      DEFAULT_SOLID_LIGHTING_SETTINGS,
    );
    expect(DEFAULT_HALFTONE_SETTINGS.animation).toEqual(
      DEFAULT_SOLID_ANIMATION_SETTINGS,
    );
  });

  it('fills missing nested fields from the selected solid surface defaults', () => {
    const normalized = normalizeHalftoneStudioSettings(
      JSON.parse(`{
        "material": { "surface": "solid" },
        "lighting": { "height": 4 },
        "animation": { "hoverReturn": false }
      }`) as Partial<HalftoneStudioSettings>,
    );

    expect(normalized.lighting).toEqual({
      ...DEFAULT_SOLID_LIGHTING_SETTINGS,
      height: 4,
    });
    expect(normalized.animation).toEqual({
      ...DEFAULT_SOLID_ANIMATION_SETTINGS,
      hoverReturn: false,
    });
  });

  it('fills missing nested fields from the selected glass surface defaults', () => {
    const normalized = normalizeHalftoneStudioSettings(
      JSON.parse(`{
        "material": { "surface": "glass" },
        "lighting": { "height": 4 },
        "animation": { "hoverReturn": false }
      }`) as Partial<HalftoneStudioSettings>,
    );

    expect(normalized.lighting).toEqual({
      ...DEFAULT_GLASS_LIGHTING_SETTINGS,
      height: 4,
    });
    expect(normalized.animation).toEqual({
      ...DEFAULT_GLASS_ANIMATION_SETTINGS,
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
      }`) as Partial<HalftoneStudioSettings>,
    );

    expect(normalized.halftone.dashColor).toBe('#112233');
    expect(normalized.halftone.hoverDashColor).toBe(
      DEFAULT_HALFTONE_SETTINGS.halftone.hoverDashColor,
    );
    expect(normalized.halftone.toneTarget).toBe(
      DEFAULT_HALFTONE_SETTINGS.halftone.toneTarget,
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
      }`) as Partial<HalftoneStudioSettings>,
    );

    expect(normalized.halftone.toneTarget).toBe('dark');
  });
});
