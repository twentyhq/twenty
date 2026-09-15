import { type HalftoneModelProps } from '@/platform/visuals/rigs/HalftoneModel';

// The decorative quote-mark behind the testimonial text. The model session's
// solid defaults already match the old quote exactly (band halftone scale
// 24.72 / blue #4a38f5, #d4d0c8 material, solid lighting), so only the framing
// and the slow breathe + hover-follow (no auto-rotate) are overridden.
export const PARTNER_QUOTE_VISUAL: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings' | 'initialPose'
> = {
  modelUrl: '/models/quote.glb',
  settings: {
    previewDistance: 6,
    halftone: { variant: 'band' },
    animation: {
      autoRotateEnabled: false,
      breatheEnabled: true,
      breatheAmount: 0.02,
      breatheSpeed: 0.2,
      followHoverEnabled: true,
      hoverRange: 8,
      hoverEase: 0.02,
      springReturnEnabled: true,
      springStrength: 0.06,
    },
  },
  initialPose: {
    autoElapsed: 126.7357000006041,
    rotateElapsed: 10.021299999999943,
    rotationX: (-80 * Math.PI) / 180,
    rotationY: (10 * Math.PI) / 180,
    rotationZ: (350 * Math.PI) / 180,
    timeElapsed: 289.53700000066755,
  },
};
