import { Loader } from '@ui/feedback';
import { baseTransitionTiming } from '@ui/input/button/components/Button/constant';
import { IconComponent } from '@ui/display';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';

const StyledIcon = styled.div<{
  isLoading: boolean;
}>`
  align-items: center;
  display: flex;
  height: 100%;
  color: var(--tw-button-color);

  padding: 8px;

  opacity: ${({ isLoading }) => (isLoading ? 0 : 1)};
  transition: opacity ${baseTransitionTiming / 2}ms ease;
  transition-delay: ${({ isLoading }) =>
    isLoading ? '0ms' : `${baseTransitionTiming / 2}ms`};
`;

const StyledIconWrapper = styled.div<{ isLoading: boolean }>`
  align-items: center;
  display: flex;
  height: 100%;

  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  width: ${({ isLoading }) => (isLoading ? 0 : '100%')};

  pointer-events: none;
`;

const StyledLoader = styled.div<{ isLoading: boolean }>`
  left: ${({ theme }) => theme.spacing(2)};
  opacity: ${({ isLoading }) => (isLoading ? 1 : 0)};
  position: absolute;

  transition: opacity ${baseTransitionTiming / 2}ms ease;
  transition-delay: ${({ isLoading }) =>
    isLoading ? `${baseTransitionTiming / 2}ms` : '0ms'};
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
    <StyledIconWrapper isLoading={!!isLoading}>
      {isDefined(isLoading) && (
        <StyledLoader isLoading={isLoading}>
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
