import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';

import { Skeleton } from './Skeleton';

export type SkeletonTextProps = {
  lines?: number;
  lineHeight?: number | string;
  gap?: number | string;
  lastLineWidth?: string;
  className?: string;
};

const StyledContainer = styled.div<{
  skeletonGap?: number | string;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ skeletonGap }) =>
    skeletonGap === undefined
      ? themeCssVariables.spacing[2]
      : typeof skeletonGap === 'number'
        ? `${skeletonGap}px`
        : skeletonGap};
  width: 100%;
`;

export const SkeletonText = ({
  lines = 3,
  lineHeight = 16,
  gap,
  lastLineWidth = '60%',
  className,
}: SkeletonTextProps) => (
  <StyledContainer className={className} skeletonGap={gap}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={`skeleton-line-${index}`}
        variant="text"
        width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
        height={lineHeight}
      />
    ))}
  </StyledContainer>
);
