import { Loader } from '@ui/feedback';
import { baseTransitionTiming } from '@ui/input/button/components/Button/constant';
import { IconComponent } from '@ui/display';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';

const StyledIcon = styled.div<{
  loading?: boolean;
}>`
  align-items: center;
  display: flex;
  height: 100%;
  color: var(--tw-button-color);

  padding: 8px;

  opacity: ${({ loading }) => (loading ? 0 : 1)};
  transition: opacity ${baseTransitionTiming / 2}ms ease;
  transition-delay: ${({ loading }) =>
    loading ? '0ms' : `${baseTransitionTiming / 2}ms`};
`;

const StyledIconWrapper = styled.div<{ loading?: boolean }>`
  align-items: center;
  display: flex;
  height: 100%;

  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  width: ${({ loading }) => (loading ? 0 : '100%')};

  pointer-events: none;
`;

const StyledLoader = styled.div<{ loading?: boolean }>`
  left: ${({ theme }) => theme.spacing(2)};
  opacity: ${({ loading }) => (loading ? 1 : 0)};
  position: absolute;

  transition: opacity ${baseTransitionTiming / 2}ms ease;
  transition-delay: ${({ loading }) =>
    loading ? `${baseTransitionTiming / 2}ms` : '0ms'};
  width: ${({ theme }) => theme.spacing(6)};
`;

export const ButtonIcon = ({
  Icon,
  loading,
}: {
  Icon?: IconComponent;
  loading?: boolean;
}) => {
  const theme = useTheme();
  return (
    <StyledIconWrapper loading={loading}>
      {isDefined(loading) && (
        <StyledLoader loading={loading}>
          <Loader />
        </StyledLoader>
      )}
      {Icon && (
        <StyledIcon loading={loading}>
          <Icon size={theme.icon.size.sm} />
        </StyledIcon>
      )}
    </StyledIconWrapper>
  );
};
