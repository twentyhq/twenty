import { styled } from '@linaria/react';

import {
  HalftoneModel,
  type HalftoneModelProps,
} from '@/platform/visuals/rigs/HalftoneModel';
import { radius } from '@/tokens';

// WhyTwentyVisual's frame, without its texture: one object on the hero.
const VisualFrame = styled.div`
  border-radius: ${radius(1)};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const Layer = styled.div`
  inset: 0;
  position: absolute;
`;

type ProgramHeroVisualProps = {
  // Marks where Thomas's 3D object goes once delivered.
  slot: string;
  model: Pick<HalftoneModelProps, 'modelUrl' | 'settings' | 'initialPose'>;
};

export function ProgramHeroVisual({ model, slot }: ProgramHeroVisualProps) {
  return (
    <VisualFrame aria-hidden data-model-slot={slot}>
      <Layer>
        <HalftoneModel
          initialPose={model.initialPose}
          modelUrl={model.modelUrl}
          priority
          settings={model.settings}
        />
      </Layer>
    </VisualFrame>
  );
}
