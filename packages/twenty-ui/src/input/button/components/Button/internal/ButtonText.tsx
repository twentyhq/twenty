import styled from '@emotion/styled';
import { baseTransitionTiming } from '@ui/input/button/components/Button/constant';

const StyledEllipsis = styled.div<{ isLoading?: boolean }>`
  right: 0;
  clip-path: ${({ theme, isLoading }) =>
    isLoading ? `inset(0 0 0 0)` : `inset(0 0 0 ${theme.spacing(6)})`};
  overflow: hidden;
  position: absolute;

  transition: clip-path ${baseTransitionTiming}ms ease;
`;

const StyledTextWrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  position: relative;
`;

const StyledText = styled.div<{ isLoading?: boolean; hasIcon: boolean }>`
  clip-path: ${({ isLoading, theme, hasIcon }) =>
    isLoading
      ? ` inset(0 ${!hasIcon ? theme.spacing(12) : theme.spacing(6)} 0 0)`
      : ' inset(0 0 0 0)'};

  overflow: hidden;

  transform: ${({ theme, isLoading, hasIcon }) =>
    isLoading
      ? `translateX(${!hasIcon ? theme.spacing(7) : theme.spacing(3)})`
      : 'none'};

  transition:
    transform ${baseTransitionTiming}ms ease,
    clip-path ${baseTransitionTiming}ms ease;

  transition-delay: ${({ isLoading }) =>
    isLoading ? '0ms' : `${baseTransitionTiming / 4}ms`};
  white-space: nowrap;
`;

export const ButtonText = ({
  hasIcon = false,
  isLoading,
  title,
}: {
  isLoading?: boolean;
  hasIcon: boolean;
  title?: string;
}) => (
  <StyledTextWrapper>
    <StyledText isLoading={isLoading} hasIcon={hasIcon}>
      {title}
    </StyledText>
    <StyledEllipsis isLoading={isLoading}>...</StyledEllipsis>
  </StyledTextWrapper>
);
