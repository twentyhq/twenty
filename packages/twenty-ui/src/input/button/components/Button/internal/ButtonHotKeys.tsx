import { styled } from '@linaria/react';

import {
  type ButtonAccent,
  type ButtonSize,
  type ButtonVariant,
} from '@ui/input';
import { themeCssVariables } from '@ui/theme';
import { getOsShortcutSeparator } from '@ui/utilities';

const StyledSeparator = styled.div<{
  buttonSize: ButtonSize;
  accent: ButtonAccent;
}>`
  background: ${({ accent }) => {
    switch (accent) {
      case 'blue':
        return themeCssVariables.buttons.secondaryTextColor;
      case 'danger':
        return themeCssVariables.border.color.danger;
      default:
        return themeCssVariables.font.color.light;
    }
  }};
  height: ${({ buttonSize }) =>
    buttonSize === 'small'
      ? themeCssVariables.spacing[2]
      : themeCssVariables.spacing[4]};
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
        return themeCssVariables.buttons.secondaryTextColor;
      case 'danger':
        return variant === 'primary'
          ? themeCssVariables.border.color.danger
          : themeCssVariables.color.red8;
      default:
        return themeCssVariables.font.color.light;
    }
  }};
  font-weight: ${themeCssVariables.font.weight.medium};
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
