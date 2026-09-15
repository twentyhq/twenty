import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { type ReactNode } from 'react';

const BACKGROUND_SRC = '/images/product/stepper/background.webp';
const SHAPE_SRC = '/images/product/stepper/background-shape.webp';

const FrameRoot = styled.div`
  aspect-ratio: 672 / 705;
  position: relative;
  width: 100%;
`;

const ShapeOverlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 0;
`;

const shapeImageClassName = css`
  height: 100%;
  object-fit: fill;
  object-position: center;
  width: 100%;
`;

const PatternBackdrop = styled.div`
  inset: 0;
  opacity: 0.55;
  pointer-events: none;
  position: absolute;
  z-index: 1;
`;

const patternImageClassName = css`
  object-fit: cover;
  object-position: center;
`;

const SlideArea = styled.div`
  inset: 6%;
  position: absolute;
  z-index: 2;
`;

export function ProductStepperVisualFrame({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <FrameRoot>
      <ShapeOverlay aria-hidden>
        <NextImage
          alt=""
          className={shapeImageClassName}
          fill
          priority={false}
          sizes="(min-width: 921px) 50vw, 100vw"
          src={SHAPE_SRC}
        />
      </ShapeOverlay>
      <PatternBackdrop aria-hidden>
        <NextImage
          alt=""
          className={patternImageClassName}
          fill
          sizes="(min-width: 921px) 50vw, 100vw"
          src={BACKGROUND_SRC}
        />
      </PatternBackdrop>
      <SlideArea>{children}</SlideArea>
    </FrameRoot>
  );
}
