import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';

type SkeletonVariant = 'rectangular' | 'circular' | 'text';

export type SkeletonProps = {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  className?: string;
};

const StyledSkeleton = styled.div<{
  variant: SkeletonVariant;
  skeletonWidth?: number | string;
  skeletonHeight?: number | string;
  skeletonBorderRadius?: number | string;
}>`
  background: linear-gradient(
    90deg,
    ${themeCssVariables.background.tertiary} 25%,
    ${themeCssVariables.background.transparent.lighter} 50%,
    ${themeCssVariables.background.tertiary} 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  width: ${({ skeletonWidth }) =>
    skeletonWidth === undefined
      ? '100%'
      : typeof skeletonWidth === 'number'
        ? `${skeletonWidth}px`
        : skeletonWidth};

  height: ${({ variant, skeletonHeight }) => {
    if (skeletonHeight !== undefined) {
      return typeof skeletonHeight === 'number'
        ? `${skeletonHeight}px`
        : skeletonHeight;
    }
    if (variant === 'text') return '1em';
    if (variant === 'circular') return '40px';
    return '100%';
  }};

  border-radius: ${({ variant, skeletonBorderRadius }) => {
    if (skeletonBorderRadius !== undefined) {
      return typeof skeletonBorderRadius === 'number'
        ? `${skeletonBorderRadius}px`
        : skeletonBorderRadius;
    }
    if (variant === 'circular') return '50%';
    if (variant === 'text') return themeCssVariables.border.radius.sm;
    return themeCssVariables.border.radius.sm;
  }};

  aspect-ratio: ${({ variant }) => (variant === 'circular' ? '1 / 1' : 'auto')};

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  borderRadius,
  className,
}: SkeletonProps) => (
  <StyledSkeleton
    className={className}
    variant={variant}
    skeletonWidth={width}
    skeletonHeight={height}
    skeletonBorderRadius={borderRadius}
    role="status"
    aria-label="Loading"
  />
);
