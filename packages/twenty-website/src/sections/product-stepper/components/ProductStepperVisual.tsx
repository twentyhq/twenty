'use client';

import { styled } from '@linaria/react';
import { EASING, mediaUp } from '@/tokens';

import { type ProductStepperStep } from '../types/product-stepper-step';
import { ProductStepperVisualFrame } from './ProductStepperVisualFrame';

const VisualColumn = styled.div`
  min-width: 0;
  order: -1;
  width: 100%;

  ${mediaUp('md')} {
    align-items: center;
    align-self: start;
    display: flex;
    height: calc(100vh - 4.5rem);
    justify-content: center;
    order: 0;
    position: sticky;
    top: 4.5rem;
  }
`;

const VisualMeasure = styled.div`
  min-width: 0;
  width: 100%;

  ${mediaUp('md')} {
    max-width: 672px;
  }
`;

const Slide = styled.div`
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
    transform: translateY(0) scale(1);
  }
`;

const SlideInner = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

type ProductStepperVisualProps = {
  activeStepIndex: number;
  steps: readonly ProductStepperStep[];
};

export function ProductStepperVisual({
  activeStepIndex,
  steps,
}: ProductStepperVisualProps) {
  return (
    <VisualColumn>
      <VisualMeasure>
        <ProductStepperVisualFrame>
          {steps.map(({ heading, Visual }, stepNumber) => {
            const isActive = stepNumber === activeStepIndex;

            return (
              <Slide data-active={isActive ? '' : undefined} key={heading.id}>
                <SlideInner>
                  <Visual active={isActive} />
                </SlideInner>
              </Slide>
            );
          })}
        </ProductStepperVisualFrame>
      </VisualMeasure>
    </VisualColumn>
  );
}
