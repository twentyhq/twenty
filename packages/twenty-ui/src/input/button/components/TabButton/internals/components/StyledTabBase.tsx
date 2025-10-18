import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';

export const StyledTabButton = styled('button', {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'active',
})<{
  active?: boolean;
  disabled?: boolean;
  to?: string;
}>`
  all: unset;
  align-items: center;
  color: ${({ theme, active, disabled }) =>
    active
      ? theme.font.color.primary
      : disabled
        ? theme.font.color.light
        : theme.font.color.secondary};
  cursor: pointer;
  background-color: transparent;
  border: none;
  font-family: inherit;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};
  text-decoration: none;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme, active }) =>
      active ? theme.border.color.inverted : 'transparent'};
    z-index: 1;
  }
`;

export const StyledTabContainer = styled.div<{
  active?: boolean;
  disabled?: boolean;
}>`
  align-items: center;
  color: ${({ theme, active, disabled }) =>
    active
      ? theme.font.color.primary
      : disabled
        ? theme.font.color.light
        : theme.font.color.secondary};
  cursor: pointer;
  background-color: transparent;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  text-decoration: none;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme, active }) =>
      active ? theme.border.color.inverted : 'transparent'};
    z-index: 1;
  }
`;

export const StyledTabHover = styled.span<{
  contentSize?: 'sm' | 'md';
}>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme, contentSize }) =>
    contentSize === 'sm'
      ? `${theme.spacing(1)} ${theme.spacing(2)}`
      : `${theme.spacing(2)} ${theme.spacing(2)}`};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
  &:active {
    background: ${({ theme }) => theme.background.quaternary};
  }
`;
