'use client';

import { styled } from '@linaria/react';

import {
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { StepperProgressRail } from '@/ui';

import { type ComponentContent } from '../component-content';

// The rail centres itself in a 100vh sticky box and hides below md. In a
// preview frame that pushes it out of view, so the frame lets it sit in flow.
const Frame = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  & [class*='StickyViewportCenter_'] {
    height: auto;
    max-height: none;
    position: static;
  }
`;

const BelowDesktop = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  padding: ${spacing(4)};
  text-align: center;

  ${mediaUp('md')} {
    display: none;
  }
`;

export const STEPPER_PROGRESS_RAIL_CONTENT: ComponentContent = {
  name: 'StepperProgressRail',
  summary:
    'A desktop-only sticky rail of step pills; the active pill stretches, fills by its progress and shows its number.',
  examples: [
    {
      id: 'rail',
      title: 'Step 2, 40% through',
      description:
        'Desktop only: hidden under 921px. Here the inactive pills take the scheme’s lineStrong, the same black-20 as the default on light; on dark the default disappears.',
      code: '<StepperProgressRail stepCount={4} activeStepIndex={1} localProgress={0.4} inactiveColor={semanticColor.lineStrong} />',
      render: () => (
        <Frame>
          <BelowDesktop>
            Hidden under 921px: widen the window to see it.
          </BelowDesktop>
          <StepperProgressRail
            activeStepIndex={1}
            inactiveColor={semanticColor.lineStrong}
            localProgress={0.4}
            stepCount={4}
          />
        </Frame>
      ),
    },
  ],
};
