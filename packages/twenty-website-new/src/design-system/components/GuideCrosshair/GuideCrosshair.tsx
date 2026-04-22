import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties } from 'react';

const Root = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: var(--guide-z-index, 1);
  }
`;

const HorizontalLineLeft = styled.div`
  @media (min-width: ${theme.breakpoints.md}px) {
    background-color: var(--guide-line-color);
    height: var(--guide-stroke);
    left: 0;
    position: absolute;
    top: var(--guide-cross-y);
    width: calc(var(--guide-cross-x) - var(--guide-gap));
  }
`;

const HorizontalLineRight = styled.div`
  @media (min-width: ${theme.breakpoints.md}px) {
    background-color: var(--guide-line-color);
    height: var(--guide-stroke);
    position: absolute;
    right: 0;
    top: var(--guide-cross-y);
    width: calc(100% - var(--guide-cross-x) - var(--guide-gap));
  }
`;

const VerticalLineTop = styled.div`
  @media (min-width: ${theme.breakpoints.md}px) {
    background-color: var(--guide-line-color);
    height: calc(var(--guide-cross-y) - var(--guide-gap));
    left: var(--guide-cross-x);
    position: absolute;
    top: 0;
    width: var(--guide-stroke);
  }
`;

const VerticalLineBottom = styled.div`
  @media (min-width: ${theme.breakpoints.md}px) {
    background-color: var(--guide-line-color);
    bottom: 0;
    height: calc(100% - var(--guide-cross-y) - var(--guide-gap));
    left: var(--guide-cross-x);
    position: absolute;
    width: var(--guide-stroke);
  }
`;

const Plus = styled.div`
  @media (min-width: ${theme.breakpoints.md}px) {
    height: var(--guide-plus-size);
    left: calc(var(--guide-cross-x) - var(--guide-plus-offset));
    position: absolute;
    top: calc(var(--guide-cross-y) - var(--guide-plus-offset));
    width: var(--guide-plus-size);

    &::before,
    &::after {
      background-color: var(--guide-plus-color);
      content: '';
      position: absolute;
    }

    &::before {
      height: var(--guide-plus-size);
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      width: var(--guide-stroke);
    }

    &::after {
      height: var(--guide-stroke);
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: var(--guide-plus-size);
    }
  }
`;

type GuideCrosshairProps = {
  className?: string;
  crossX: string;
  crossY: string;
  gap?: string;
  lineColor?: string;
  plusColor?: string;
  plusOffset?: string;
  plusSize?: string;
  strokeWidth?: string;
  zIndex?: number;
};

export function GuideCrosshair({
  className,
  crossX,
  crossY,
  gap = '18px',
  lineColor = theme.colors.primary.border[10],
  plusColor = theme.colors.highlight[100],
  plusOffset = '6px',
  plusSize = '12px',
  strokeWidth = '1px',
  zIndex = 1,
}: GuideCrosshairProps) {
  const style = {
    '--guide-cross-x': crossX,
    '--guide-cross-y': crossY,
    '--guide-gap': gap,
    '--guide-line-color': lineColor,
    '--guide-plus-color': plusColor,
    '--guide-plus-offset': plusOffset,
    '--guide-plus-size': plusSize,
    '--guide-stroke': strokeWidth,
    '--guide-z-index': String(zIndex),
  } as CSSProperties;

  return (
    <Root aria-hidden className={className} style={style}>
      <HorizontalLineLeft />
      <HorizontalLineRight />
      <VerticalLineTop />
      <VerticalLineBottom />
      <Plus />
    </Root>
  );
}
