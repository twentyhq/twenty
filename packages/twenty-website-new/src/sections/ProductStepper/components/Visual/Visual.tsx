import type { ProductStepperVisualProps } from '@/sections/ProductStepper/types';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { StepperVisualFrame } from '../StepperVisualFrame/StepperVisualFrame';

const PRODUCT_STEPPER_BACKGROUND = '/images/product/stepper/background.png';
const PRODUCT_STEPPER_SHAPE = '/images/product/stepper/background-shape.png';

const VisualColumn = styled.div`
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 672px;
    position: sticky;
    top: ${theme.spacing(10)};
  }
`;

const slideImageClassName = css`
  object-fit: contain;
  object-position: center;
  opacity: 0;
  transition: opacity 0.4s ease;

  &[data-active='true'] {
    opacity: 1;
  }
`;

export function Visual({ activeStepIndex, images }: ProductStepperVisualProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <VisualColumn>
      <StepperVisualFrame
        backgroundSrc={PRODUCT_STEPPER_BACKGROUND}
        shapeSrc={PRODUCT_STEPPER_SHAPE}
      >
        {images.map((image, index) => {
          if (!image) return null;

          return (
            <NextImage
              key={`${image.src}-${index}`}
              alt={image.alt}
              className={slideImageClassName}
              data-active={String(index === activeStepIndex)}
              fill
              sizes="(min-width: 921px) 672px, 100vw"
              src={image.src}
            />
          );
        })}
      </StepperVisualFrame>
    </VisualColumn>
  );
}
