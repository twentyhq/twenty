'use client';

import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ComponentType } from 'react';

import { HomeStepper } from '@/sections/home-stepper';
import { color, EASING, REDUCED_MOTION } from '@/tokens';

export type ProgramStepperStep = {
  body: MessageDescriptor;
  heading: MessageDescriptor;
  // progress: how far the reader is through this step (0 to 1), only while
  // the stepper scrolls; visuals may ignore it.
  Visual: ComponentType<{ active: boolean; progress?: number }>;
};

// One visual per step, cross-fading as the steps change.
const Slide = styled.div`
  display: flex;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transform: translateY(18px) scale(0.985);
  transition:
    opacity 0.55s ${EASING.gentle},
    transform 0.55s ${EASING.standard};

  &[data-active] {
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// The home stepper's halftone backdrop, taken down to a light grey so the
// program's panels come forward: the stage turns a pale grey and the dashes,
// inverted and faint, sit just darker than it.
const LightBackdrop = styled.div`
  & [data-illustration='stepper-backdrop'] {
    background-color: ${color('white-hover')};
  }

  & [data-illustration='stepper-backdrop'] canvas {
    filter: invert(1);
    opacity: 0.08;
  }
`;

const stepProgress = (
  stepIndex: number,
  activeStepIndex: number,
  localProgress: number,
) => {
  if (stepIndex < activeStepIndex) return 1;
  if (stepIndex > activeStepIndex) return 0;
  return localProgress;
};

type ProgramStepperProps = {
  anchorId?: string;
  steps: readonly ProgramStepperStep[];
};

// The home's stepper, steps and frame, with a partner program's own visuals.
export function ProgramStepper({ anchorId, steps }: ProgramStepperProps) {
  return (
    <LightBackdrop>
      <HomeStepper
        anchorId={anchorId}
        renderVisual={({ activeStepIndex, localProgress }) =>
          steps.map(({ heading, Visual }, stepIndex) => {
            const isActive = stepIndex === activeStepIndex;

            return (
              <Slide data-active={isActive ? '' : undefined} key={heading.id}>
                <Visual
                  active={isActive}
                  progress={
                    localProgress === undefined
                      ? undefined
                      : stepProgress(stepIndex, activeStepIndex, localProgress)
                  }
                />
              </Slide>
            );
          })
        }
        steps={steps}
      />
    </LightBackdrop>
  );
}
