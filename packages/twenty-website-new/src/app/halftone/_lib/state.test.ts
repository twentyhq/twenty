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
});
