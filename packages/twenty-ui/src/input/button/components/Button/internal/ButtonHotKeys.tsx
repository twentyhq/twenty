import { styled } from '@linaria/react';

import {
  type ButtonAccent,
  type ButtonSize,
  type ButtonVariant,
} from '@ui/input';
import { themeVar } from '@ui/theme';
import { getOsShortcutSeparator } from '@ui/utilities';

const StyledSeparator = styled.div<{
  buttonSize: ButtonSize;
  accent: ButtonAccent;
}>`
  background: ${({ accent }) => {
    switch (accent) {
      case 'blue':
        return themeVar.buttons.secondaryTextColor;
      case 'danger':
        return themeVar.border.color.danger;
      default:
        return themeVar.font.color.light;
    }
  }};
  height: ${({ buttonSize }) =>
    buttonSize === 'small' ? themeVar.spacing[2] : themeVar.spacing[4]};
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
        return themeVar.buttons.secondaryTextColor;
      case 'danger':
        return variant === 'primary'
          ? themeVar.border.color.danger
          : themeVar.color.red8;
      default:
        return themeVar.font.color.light;
    }
  }};
  font-weight: ${themeVar.font.weight.medium};
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
