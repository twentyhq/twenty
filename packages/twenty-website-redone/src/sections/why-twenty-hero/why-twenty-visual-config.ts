import { paletteColorNumber } from '@/tokens';

import { type HalftoneModelProps } from '@/platform/visuals/rigs/halftone-model';

// The /why-twenty hero "20": the studio-default solid band halftone (the
// redone band defaults ARE this scene's studio export), recoloured to a white
// dash that shifts to brand blue on hover, with slow auto-rotate + drag and
// held at its authored pose. Framed slightly farther than default
// (previewDistance 6).
export const WHY_TWENTY_HERO: Pick<
  HalftoneModelProps,
  'modelUrl' | 'settings' | 'initialPose'
> = {
  modelUrl: '/models/why-twenty-hero.glb',
  settings: {
    previewDistance: 6,
    halftone: {
      variant: 'band',
      dashColor: paletteColorNumber('white'),
    },
    animation: {
      autoSpeed: 0.1,
      followDragEnabled: true,
    },
  },
  initialPose: {
    autoElapsed: 11.408300000000029,
    rotateElapsed: 0,
    rotationX: -0.30530352681215056,
    rotationY: 4.763043016616201,
    rotationZ: 0,
    targetRotationX: -0.5363124999999984,
    targetRotationY: 3.6318124999999988,
    timeElapsed: 45.72360000009537,
  },
};
