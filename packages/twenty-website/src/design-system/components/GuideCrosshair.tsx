import { theme } from '@/theme';
import { styled } from '@linaria/react';

type RootProps = { $zIndex: number };

const Root = styled.div<RootProps>`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: ${({ $zIndex }) => $zIndex};
  }
`;

type HorizontalLineProps = {
  $color: string;
  $stroke: string;
  $crossY: string;
  $crossX: string;
  $gap: string;
};

const HorizontalLineLeft = styled.div<HorizontalLineProps>`
  @media (min-width: ${theme.breakpoints.md}px) {
    background-color: ${({ $color }) => $color};
    height: ${({ $stroke }) => $stroke};
    left: 0;
    position: absolute;
    top: ${({ $crossY }) => $crossY};
    width: calc(${({ $crossX }) => $crossX} - ${({ $gap }) => $gap});
  }
`;

const HorizontalLineRight = styled.div<HorizontalLineProps>`
  @media (min-width: ${theme.breakpoints.md}px) {
    background-color: ${({ $color }) => $color};
    height: ${({ $stroke }) => $stroke};
    position: absolute;
    right: 0;
    top: ${({ $crossY }) => $crossY};
    width: calc(100% - ${({ $crossX }) => $crossX} - ${({ $gap }) => $gap});
  }
`;

type VerticalLineProps = {
  $color: string;
  $stroke: string;
  $crossX: string;
  $crossY: string;
  $gap: string;
};

const VerticalLineTop = styled.div<VerticalLineProps>`
  @media (min-width: ${theme.breakpoints.md}px) {
    background-color: ${({ $color }) => $color};
    height: calc(${({ $crossY }) => $crossY} - ${({ $gap }) => $gap});
    left: ${({ $crossX }) => $crossX};
    position: absolute;
    top: 0;
    width: ${({ $stroke }) => $stroke};
  }
`;

const VerticalLineBottom = styled.div<VerticalLineProps>`
  @media (min-width: ${theme.breakpoints.md}px) {
    background-color: ${({ $color }) => $color};
    bottom: 0;
    height: calc(100% - ${({ $crossY }) => $crossY} - ${({ $gap }) => $gap});
    left: ${({ $crossX }) => $crossX};
    position: absolute;
    width: ${({ $stroke }) => $stroke};
  }
`;

type PlusProps = {
  $crossX: string;
  $crossY: string;
  $offset: string;
  $size: string;
  $color: string;
  $stroke: string;
};

const Plus = styled.div<PlusProps>`
  @media (min-width: ${theme.breakpoints.md}px) {
    height: ${({ $size }) => $size};
    left: calc(${({ $crossX }) => $crossX} - ${({ $offset }) => $offset});
    position: absolute;
    top: calc(${({ $crossY }) => $crossY} - ${({ $offset }) => $offset});
    width: ${({ $size }) => $size};

    &::before,
    &::after {
      background-color: ${({ $color }) => $color};
      content: '';
      position: absolute;
    }

    &::before {
      height: ${({ $size }) => $size};
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      width: ${({ $stroke }) => $stroke};
    }

    &::after {
      height: ${({ $stroke }) => $stroke};
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: ${({ $size }) => $size};
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
  return (
    <Root $zIndex={zIndex} aria-hidden className={className}>
      <HorizontalLineLeft
        $color={lineColor}
        $crossX={crossX}
        $crossY={crossY}
        $gap={gap}
        $stroke={strokeWidth}
      />
      <HorizontalLineRight
        $color={lineColor}
        $crossX={crossX}
        $crossY={crossY}
        $gap={gap}
        $stroke={strokeWidth}
      />
      <VerticalLineTop
        $color={lineColor}
        $crossX={crossX}
        $crossY={crossY}
        $gap={gap}
        $stroke={strokeWidth}
      />
      <VerticalLineBottom
        $color={lineColor}
        $crossX={crossX}
        $crossY={crossY}
        $gap={gap}
        $stroke={strokeWidth}
      />
      <Plus
        $color={plusColor}
        $crossX={crossX}
        $crossY={crossY}
        $offset={plusOffset}
        $size={plusSize}
        $stroke={strokeWidth}
      />
    </Root>
  );
}
