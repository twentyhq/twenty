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

  it.each(['solid', 'glass', 'metal'] as const)(
    'fills missing nested fields from the selected %s surface defaults',
    (surface) => {
      const normalized = normalizeHalftoneStudioSettings({
        material: { surface },
        lighting: { height: 4 },
        animation: { hoverReturn: false },
      });

      expect(normalized.material).toEqual(
        HALFTONE_STUDIO_DEFAULTS.materialBySurface[surface],
      );
      expect(normalized.lighting).toEqual({
        ...HALFTONE_STUDIO_DEFAULTS.lightingBySurface[surface],
        height: 4,
      });
      expect(normalized.animation).toEqual({
        ...HALFTONE_STUDIO_DEFAULTS.animationBySurface[surface],
        hoverReturn: false,
      });
    },
  );

  it('resets environment power only for presets saved before environment rotation', () => {
    const legacy = normalizeHalftoneStudioSettings({
      material: { surface: 'solid', environmentPower: 5 },
    });
    const current = normalizeHalftoneStudioSettings({
      material: {
        surface: 'solid',
        environmentPower: 2.2,
        environmentRotation: 90,
      },
    });

    expect(legacy.material.environmentPower).toBe(
      HALFTONE_STUDIO_DEFAULTS.solidMaterial.environmentPower,
    );
    expect(current.material.environmentPower).toBe(2.2);
    expect(current.material.environmentRotation).toBe(90);
  });

  it('falls back to the surface texture when a preset names an unknown one', () => {
    const unknown = normalizeHalftoneStudioSettings(
      JSON.parse(
        '{ "material": { "surface": "metal", "texture": "frosted" } }',
      ),
    );
    const none = normalizeHalftoneStudioSettings({
      material: { surface: 'metal', texture: 'none' },
    });

    expect(unknown.material.texture).toBe(
      HALFTONE_STUDIO_DEFAULTS.metalMaterial.texture,
    );
    expect(none.material.texture).toBe('none');
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
