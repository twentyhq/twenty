'use client';

import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import type { ComponentType } from 'react';

import type { StepperVisualProps } from './types';
import { StepperVisualFrame } from './StepperVisualFrame';

type StepVisual = {
  visual: ComponentType<StepperVisualProps>;
};

type ProductStepperVisualProps = {
  activeStepIndex: number;
  stepVisuals: StepVisual[];
};

const PRODUCT_STEPPER_BACKGROUND = '/images/product/stepper/background.webp';
const PRODUCT_STEPPER_SHAPE = '/images/product/stepper/background-shape.webp';

const VisualColumn = styled.div`
  min-width: 0;
  width: 100%;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    order: -1;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    align-self: start;
    display: flex;
    height: calc(100vh - 4.5rem);
    justify-content: center;
    position: sticky;
    top: 4.5rem;
  }
`;

const VisualFrame = styled.div`
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
  }
`;

const slideClassName = css`
  inset: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.4s ease;

  &[data-active='true'] {
    opacity: 1;
    pointer-events: auto;
  }
`;

const visualWrapperClassName = css`
  display: flex;
  height: 100%;
  width: 100%;
`;

export function Visual({
  activeStepIndex,
  stepVisuals,
}: ProductStepperVisualProps) {
  if (!stepVisuals || stepVisuals.length === 0) {
    return null;
  }

  return (
    <VisualColumn>
      <VisualFrame>
        <StepperVisualFrame
          backgroundSrc={PRODUCT_STEPPER_BACKGROUND}
          shapeSrc={PRODUCT_STEPPER_SHAPE}
        >
          {stepVisuals.map((step, index) => {
            const isActive = index === activeStepIndex;
            const VisualComponent = step.visual;

            return (
              <div
                key={index}
                className={slideClassName}
                data-active={String(isActive)}
              >
                <div className={visualWrapperClassName}>
                  <VisualComponent active={isActive} />
                </div>
              </div>
            );
          })}
        </StepperVisualFrame>
      </VisualFrame>
    </VisualColumn>
  );
}
