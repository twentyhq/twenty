'use client';

import { useState } from 'react';

import { Body, StepperSwipeDeck } from '@/ui';

import { type ComponentContent } from '../component-content';

function Demo() {
  const [index, setIndex] = useState(0);
  return (
    <div style={{ width: '100%' }}>
      <StepperSwipeDeck
        activeIndex={index}
        stepCount={3}
        onActiveIndexChange={setIndex}
      >
        {(step) => <Body size="sm">{`Step ${step + 1} of 3`}</Body>}
      </StepperSwipeDeck>
    </div>
  );
}

export const STEPPER_SWIPE_DECK_CONTENT: ComponentContent = {
  name: 'StepperSwipeDeck',
  summary:
    'A horizontal swipe carousel that renders one slide per step and changes step past a short drag, with resistance at the edges.',
  examples: [
    {
      id: 'deck',
      title: 'Swipe or drag',
      code: '<StepperSwipeDeck stepCount={3} activeIndex={index} onActiveIndexChange={setIndex}>\n  {(step) => …}\n</StepperSwipeDeck>',
      render: () => <Demo />,
    },
  ],
  practices: [
    {
      id: 'motion',
      text: (
        <>
          Transitions are off under reduced motion and while dragging
          (StepperSwipeDeck.tsx:65,151)
        </>
      ),
    },
  ],
};
