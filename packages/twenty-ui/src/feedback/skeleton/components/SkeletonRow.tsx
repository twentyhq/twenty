import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';

import { Skeleton } from './Skeleton';
import { SkeletonText } from './SkeletonText';

export type SkeletonRowProps = {
  hasAvatar?: boolean;
  avatarSize?: number;
  textLines?: number;
  textLineHeight?: number;
  width?: number | string;
  className?: string;
};

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledTextContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SkeletonRow = ({
  hasAvatar = true,
  avatarSize = 40,
  textLines = 2,
  textLineHeight = 14,
  width,
  className,
}: SkeletonRowProps) => (
  <StyledRow className={className} style={width ? { width: typeof width === 'number' ? `${width}px` : width } : undefined}>
    {hasAvatar && (
      <Skeleton variant="circular" width={avatarSize} height={avatarSize} />
    )}
    <StyledTextContainer>
      <SkeletonText lines={textLines} lineHeight={textLineHeight} />
    </StyledTextContainer>
  </StyledRow>
);
