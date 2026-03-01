import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';

export const StyledTabButton = styled.button<{
  active?: boolean;
  disabled?: boolean;
  to?: string;
}>`
  all: unset;
  align-items: center;
  color: ${({ active, disabled }) =>
    active
      ? themeCssVariables.font.color.primary
      : disabled
        ? themeCssVariables.font.color.light
        : themeCssVariables.font.color.secondary};
  cursor: pointer;
  background-color: transparent;
  border: none;
  font-family: inherit;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
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
    background-color: ${({ active }) =>
      active ? themeCssVariables.border.color.inverted : 'transparent'};
    z-index: 1;
  }
`;

export const StyledTabContainer = styled.div<{
  active?: boolean;
  disabled?: boolean;
}>`
  align-items: center;
  color: ${({ active, disabled }) =>
    active
      ? themeCssVariables.font.color.primary
      : disabled
        ? themeCssVariables.font.color.light
        : themeCssVariables.font.color.secondary};
  cursor: pointer;
  background-color: transparent;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
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
    background-color: ${({ active }) =>
      active ? themeCssVariables.border.color.inverted : 'transparent'};
    z-index: 1;
  }
`;

export const StyledTabHover = styled.span<{
  contentSize?: 'sm' | 'md';
}>`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${({ contentSize }) =>
    contentSize === 'sm'
      ? `${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}`
      : `${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]}`};
  font-weight: ${themeCssVariables.font.weight.medium};
  width: 100%;
  white-space: nowrap;
  border-radius: ${themeCssVariables.border.radius.sm};
  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
  &:active {
    background: ${themeCssVariables.background.quaternary};
  }
`;
