import styled from '@emotion/styled';
import { baseTransitionTiming } from '@ui/input/button/components/Button/constant';

const StyledEllipsis = styled.div<{ loading?: boolean }>`
  right: 0;
  clip-path: ${({ theme, loading }) =>
    loading ? `inset(0 0 0 0)` : `inset(0 0 0 ${theme.spacing(6)})`};
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

const StyledText = styled.div<{ loading?: boolean; hasIcon: boolean }>`
  clip-path: ${({ loading, theme, hasIcon }) =>
    loading
      ? ` inset(0 ${!hasIcon ? theme.spacing(12) : theme.spacing(6)} 0 0)`
      : ' inset(0 0 0 0)'};

  overflow: hidden;

  transform: ${({ theme, loading, hasIcon }) =>
    loading
      ? `translateX(${!hasIcon ? theme.spacing(7) : theme.spacing(3)})`
      : 'none'};

  transition:
    transform ${baseTransitionTiming}ms ease,
    clip-path ${baseTransitionTiming}ms ease;

  transition-delay: ${({ loading }) =>
    loading ? '0ms' : `${baseTransitionTiming / 4}ms`};
  white-space: nowrap;
`;

export const ButtonText = ({
  hasIcon = false,
  loading,
  title,
}: {
  loading?: boolean;
  hasIcon: boolean;
  title?: string;
}) => (
  <StyledTextWrapper>
    <StyledText loading={loading} hasIcon={hasIcon}>
      {title}
    </StyledText>
    <StyledEllipsis loading={loading}>...</StyledEllipsis>
  </StyledTextWrapper>
);
