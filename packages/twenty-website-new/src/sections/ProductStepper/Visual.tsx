import type { ImageType } from '@/design-system/components/Image';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { StepperVisualFrame } from './StepperVisualFrame';

type ProductStepperVisualProps = {
  activeStepIndex: number;
  images: ImageType[];
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
      <VisualFrame>
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
                sizes="(min-width: 921px) 50vw, 100vw"
                src={image.src}
              />
            );
          })}
        </StepperVisualFrame>
      </VisualFrame>
    </VisualColumn>
  );
}
