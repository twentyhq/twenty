'use client';

import { StepIndicator } from '@/ui';

import { Code } from '../Code';
import { type ComponentContent } from '../component-content';

export const STEP_INDICATOR_CONTENT: ComponentContent = {
  name: 'StepIndicator',
  summary:
    'A row of dots joined by connectors, exposed as a progress bar, that tracks progress through a fixed number of steps.',
  examples: [
    {
      id: 'steps',
      title: 'Step 2 of 4',
      code: '<StepIndicator stepCount={4} activeStepIndex={1} />',
      render: () => <StepIndicator activeStepIndex={1} stepCount={4} />,
    },
  ],
  practices: [
    {
      id: 'index',
      text: (
        <>
          The consumer passes <Code>stepCount</Code> and a 0-based{' '}
          <Code>activeStepIndex</Code>; the announced value is 1-based
          (StepIndicator.tsx:45-46,60-65)
        </>
      ),
    },
  ],
};
