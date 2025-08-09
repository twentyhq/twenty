import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';
import { Loader } from '@ui/feedback';
import { baseTransitionTiming } from '@ui/input/button/components/Button/constant';

const StyledIcon = styled.div<{
  isLoading: boolean;
}>`
  align-items: center;
  display: flex;
  height: calc(100% - ${({ theme }) => theme.spacing(4)});
  color: var(--tw-button-color);

  opacity: ${({ isLoading }) => (isLoading ? 0 : 1)};
  transition: opacity ${baseTransitionTiming / 2}ms ease;
  transition-delay: ${({ isLoading }) =>
    isLoading ? '0ms' : `${baseTransitionTiming / 2}ms`};
`;

const StyledIconWrapper = styled.div`
  align-items: center;
  display: flex;

  pointer-events: none;
`;

const StyledLoader = styled.div`
  left: ${({ theme }) => theme.spacing(2)};
  opacity: 1;
  position: absolute;

  transition: opacity ${baseTransitionTiming / 2}ms ease;
  transition-delay: ${baseTransitionTiming / 2}ms;
  width: ${({ theme }) => theme.spacing(6)};
`;

export const ButtonIcon = ({
  Icon,
  isLoading,
}: {
  Icon?: IconComponent;
  isLoading?: boolean;
}) => {
  const theme = useTheme();
  return (
    <StyledIconWrapper>
      {isLoading && (
        <StyledLoader>
          <Loader />
        </StyledLoader>
      )}
      {Icon && (
        <StyledIcon isLoading={!!isLoading}>
          <Icon size={theme.icon.size.sm} />
        </StyledIcon>
      )}
    </StyledIconWrapper>
  );
};
