'use client';

import { styled } from '@linaria/react';
import { type ComponentType } from 'react';

import { mediaUp } from '@/tokens';

import { DataModelVisual } from './DataModelVisual';
import { LayoutVisual } from './LayoutVisual';
import {
  PRODUCT_STEPPER_STEPS,
  type ProductStepperVisualKey,
} from '../data/product-stepper-data';
import { ProductStepperVisualFrame } from './ProductStepperVisualFrame';
import { WorkflowVisual } from './WorkflowVisual';

const VISUALS: Record<
  ProductStepperVisualKey,
  ComponentType<{ active: boolean }>
> = {
  dataModel: DataModelVisual,
  layout: LayoutVisual,
  workflow: WorkflowVisual,
};

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
  transition: opacity 0.4s ease;

  &[data-active] {
    opacity: 1;
    pointer-events: auto;
  }
`;

const SlideInner = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export function ProductStepperVisual({
  activeStepIndex,
}: {
  activeStepIndex: number;
}) {
  return (
    <VisualColumn>
      <VisualMeasure>
        <ProductStepperVisualFrame>
          {PRODUCT_STEPPER_STEPS.map((step, stepNumber) => {
            const isActive = stepNumber === activeStepIndex;
            const Visual = VISUALS[step.visual];

            return (
              <Slide data-active={isActive ? '' : undefined} key={step.visual}>
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
