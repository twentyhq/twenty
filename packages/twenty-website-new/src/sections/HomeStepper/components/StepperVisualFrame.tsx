import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { theme } from '@/theme';

const FRAME_MASK_PATH =
  'M4 0H668a4 4 0 0 1 4 4V701a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V499L28 462V215L0 178V4a4 4 0 0 1 4-4Z';

const frameMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 672 705' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(FRAME_MASK_PATH)}' fill='black'/%3E%3C/svg%3E")`;

const FrameRoot = styled.div`
  aspect-ratio: 672 / 705;
  contain: layout style paint;
  position: relative;
  width: 100%;
`;

const PatternBackdrop = styled.div`
  inset: 0;
  opacity: 1;
  position: absolute;
  z-index: 0;
`;

const patternImageClassName = css`
  object-fit: cover;
  object-position: center;
`;

const MaskedBackdrop = styled.div`
  background-color: ${theme.colors.primary.text[100]};
  inset: 0;
  isolation: isolate;
  overflow: hidden;
  position: absolute;
  z-index: 1;
`;

const SlideArea = styled.div`
  inset: 0;
  position: absolute;
  z-index: 2;
`;

const ShapeOverlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 3;
`;

const FrameBorder = styled.svg`
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  z-index: 4;
`;

const shapeImageClassName = css`
  height: 100%;
  object-fit: fill;
  object-position: center;
  width: 100%;
`;

type StepperVisualFrameProps = {
  backgroundColor?: string;
  backgroundSrc: string;
  backgroundOverlay?: ReactNode;
  borderColor?: string;
  borderWidth?: number;
  children?: ReactNode;
  showBackgroundImage?: boolean;
  showShapeOverlay?: boolean;
  shapeSrc: string;
};

function getMaskStyle(): CSSProperties {
  return {
    WebkitMaskImage: frameMask,
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskSize: '100% 100%',
    maskImage: frameMask,
    maskPosition: 'center',
    maskRepeat: 'no-repeat',
    maskSize: '100% 100%',
  };
}

export function StepperVisualFrame({
  backgroundColor,
  backgroundSrc,
  backgroundOverlay,
  borderColor,
  borderWidth = 1,
  children,
  showBackgroundImage = true,
  showShapeOverlay = true,
  shapeSrc,
}: StepperVisualFrameProps) {
  return (
    <FrameRoot data-stepper-visual-pointer-root="">
      <MaskedBackdrop
        style={{
          ...getMaskStyle(),
          ...(backgroundColor ? { backgroundColor } : {}),
        }}
      >
        {showBackgroundImage ? (
          <PatternBackdrop aria-hidden>
            <NextImage
              alt=""
              className={patternImageClassName}
              fill
              sizes="(min-width: 921px) 50vw, 100vw"
              src={backgroundSrc}
            />
          </PatternBackdrop>
        ) : null}
        {backgroundOverlay}
      </MaskedBackdrop>
      <SlideArea>{children}</SlideArea>
      {showShapeOverlay ? (
        <ShapeOverlay aria-hidden>
          <NextImage
            alt=""
            className={shapeImageClassName}
            fill
            priority={false}
            sizes="(min-width: 921px) 50vw, 100vw"
            src={shapeSrc}
          />
        </ShapeOverlay>
      ) : null}
      {borderColor ? (
        <FrameBorder
          aria-hidden
          preserveAspectRatio="none"
          viewBox="0 0 672 705"
        >
          <path
            d={FRAME_MASK_PATH}
            fill="none"
            stroke={borderColor}
            strokeLinejoin="round"
            strokeWidth={borderWidth}
            vectorEffect="non-scaling-stroke"
          />
        </FrameBorder>
      ) : null}
    </FrameRoot>
  );
}
