import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import type { ReactNode } from 'react';

const FrameRoot = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 672 / 705;
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

type StepperVisualFrameProps = {
  backgroundSrc: string;
  children: ReactNode;
  shapeSrc: string;
};

export function StepperVisualFrame({
  backgroundSrc,
  children,
  shapeSrc,
}: StepperVisualFrameProps) {
  return (
    <FrameRoot>
      <ShapeOverlay aria-hidden>
        <NextImage
          alt=""
          className={shapeImageClassName}
          fill
          priority={false}
          sizes="(min-width: 921px) 672px, 100vw"
          src={shapeSrc}
        />
      </ShapeOverlay>
      <PatternBackdrop aria-hidden>
        <NextImage
          alt=""
          className={patternImageClassName}
          fill
          sizes="(min-width: 921px) 672px, 100vw"
          src={backgroundSrc}
        />
      </PatternBackdrop>
      <SlideArea>{children}</SlideArea>
    </FrameRoot>
  );
}
