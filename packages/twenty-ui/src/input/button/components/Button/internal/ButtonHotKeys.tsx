import { styled } from '@linaria/react';

import {
  type ButtonAccent,
  type ButtonSize,
  type ButtonVariant,
} from '@ui/input';
import { theme } from '@ui/theme';
import { getOsShortcutSeparator } from '@ui/utilities';

const StyledSeparator = styled.div<{
  buttonSize: ButtonSize;
  accent: ButtonAccent;
}>`
  background: ${({ accent }) => {
    switch (accent) {
      case 'blue':
        return theme.buttons.secondaryTextColor;
      case 'danger':
        return theme.border.color.danger;
      default:
        return theme.font.color.light;
    }
  }};
  height: ${({ buttonSize }) =>
    buttonSize === 'small' ? theme.spacing[2] : theme.spacing[4]};
  margin: 0;
  width: 1px;
`;

const StyledShortcutLabel = styled.div<{
  variant: ButtonVariant;
  accent: ButtonAccent;
}>`
  color: ${({ variant, accent }) => {
    switch (accent) {
      case 'blue':
        return theme.buttons.secondaryTextColor;
      case 'danger':
        return variant === 'primary'
          ? theme.border.color.danger
          : theme.color.red8;
      default:
        return theme.font.color.light;
    }
  }};
  font-weight: ${theme.font.weight.medium};
`;

export const ButtonHotkeys = ({
  size,
  accent,
  variant,
  hotkeys,
}: {
  size: ButtonSize;
  accent: ButtonAccent;
  variant: ButtonVariant;
  hotkeys: string[];
}) => {
  return (
    <>
      <StyledSeparator buttonSize={size} accent={accent} />
      <StyledShortcutLabel variant={variant} accent={accent}>
        {hotkeys.join(getOsShortcutSeparator())}
      </StyledShortcutLabel>
    </>
  );
};
