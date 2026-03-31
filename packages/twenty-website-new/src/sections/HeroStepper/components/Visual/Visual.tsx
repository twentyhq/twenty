import type { HeroStepperVisualProps } from '@/sections/HeroStepper/types';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { StepperVisualFrame } from '../StepperVisualFrame/StepperVisualFrame';

const HOME_STEPPER_BACKGROUND = '/images/home/stepper/background.png';
const HOME_STEPPER_SHAPE = '/images/home/stepper/background-shape.png';

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

export function Visual({
  activeImageIndex = 0,
  images,
}: HeroStepperVisualProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <VisualColumn>
      <StepperVisualFrame
        backgroundSrc={HOME_STEPPER_BACKGROUND}
        shapeSrc={HOME_STEPPER_SHAPE}
      >
        {images.map((image, index) => (
          <NextImage
            key={`${image.src}-${index}`}
            alt={image.alt}
            className={slideImageClassName}
            data-active={String(index === activeImageIndex)}
            fill
            sizes="(min-width: 921px) 672px, 100vw"
            src={image.src}
          />
        ))}
      </StepperVisualFrame>
    </VisualColumn>
  );
}
