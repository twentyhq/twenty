import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';
import { paletteColorNumber } from '@/tokens';

type LevelModel = Pick<HalftoneModelProps, 'modelUrl' | 'settings'>;

// The /partners Services recipe: blue objects on white; the top level sits
// on its dark card, so its object takes the yellow illustration accent.
const withShape = (
  modelUrl: string,
  dashColor: number = paletteColorNumber('blue'),
): LevelModel => ({
  modelUrl,
  settings: {
    previewDistance: 3.8,
    lighting: {
      intensity: 1.8,
      fillIntensity: 0.25,
      ambientIntensity: 0.18,
      angleDegrees: 132,
      height: 2.6,
    },
    material: {
      surface: 'solid',
      color: 0xd4d0c8,
      roughness: 0.38,
      metalness: 0.26,
    },
    halftone: {
      variant: 'band',
      scale: 4,
      power: 0.16,
      width: 0.62,
      dashColor,
      hoverDashColor: dashColor,
    },
    animation: {
      autoRotateEnabled: true,
      autoSpeed: 0.3,
      autoWobble: 0.04,
      followDragEnabled: false,
      springReturnEnabled: true,
      springDamping: 0.6,
      springStrength: 0.06,
    },
  },
});

// Final names: the files hold stand-ins (keycap, diamond) until Thomas drops his shapes in.
export const INTEGRATOR_LEVEL_MODELS: readonly LevelModel[] = [
  withShape('/models/integrator-level-1.glb'),
  withShape('/models/integrator-level-2.glb', paletteColorNumber('yellow')),
];
