import { styled } from '@linaria/react';
import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';

import { STEPPER_BACKDROP } from './stepper-backdrop-config';
import { type ReactNode } from 'react';

import { color } from '@/tokens';

// The notched frame that hosts the stepper visual: halftone backdrop on
// the graphite stage behind, content above, hairline border tracing the
// same path.
const FRAME_MASK_PATH =
  'M4 0H668a4 4 0 0 1 4 4V701a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V499L28 462V215L0 178V4a4 4 0 0 1 4-4Z';

const frameMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 672 705' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(FRAME_MASK_PATH)}' fill='black'/%3E%3C/svg%3E")`;

const FrameRoot = styled.div`
  aspect-ratio: 672 / 705;
  contain: layout style paint;
  position: relative;
  width: 100%;
`;

const MaskedBackdrop = styled.div`
  background-color: ${color('graphite')};
  inset: 0;
  isolation: isolate;
  mask-image: ${frameMask};
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  overflow: hidden;
  position: absolute;
  z-index: 0;
`;

const SlideArea = styled.div`
  inset: 0;
  position: absolute;
  z-index: 1;
`;

const FrameBorder = styled.svg`
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  z-index: 2;
`;

export function StepperVisualFrame({ children }: { children: ReactNode }) {
  return (
    <FrameRoot data-stepper-visual-pointer-root="">
      <MaskedBackdrop aria-hidden data-illustration="stepper-backdrop">
        <HalftoneImageBackdrop
          imageUrl={STEPPER_BACKDROP.imageUrl}
          pointerRootSelector="[data-stepper-visual-pointer-root]"
          reducedMotionMode="poster"
          settings={STEPPER_BACKDROP.settings}
        />
      </MaskedBackdrop>
      <SlideArea>{children}</SlideArea>
      <FrameBorder aria-hidden preserveAspectRatio="none" viewBox="0 0 672 705">
        <path
          d={FRAME_MASK_PATH}
          fill="none"
          stroke={color('silver')}
          strokeLinejoin="round"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </FrameBorder>
    </FrameRoot>
  );
}
