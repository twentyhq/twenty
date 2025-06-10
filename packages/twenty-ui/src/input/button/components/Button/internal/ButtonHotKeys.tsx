import { getOsShortcutSeparator } from '@ui/utilities';
import { ButtonAccent, ButtonSize, ButtonVariant } from '@ui/input';
import styled from '@emotion/styled';

const StyledSeparator = styled.div<{
  buttonSize: ButtonSize;
  accent: ButtonAccent;
}>`
  background: ${({ theme, accent }) => {
    switch (accent) {
      case 'blue':
        return theme.border.color.blue;
      case 'danger':
        return theme.border.color.danger;
      default:
        return theme.font.color.light;
    }
  }};
  height: ${({ theme, buttonSize }) =>
    theme.spacing(buttonSize === 'small' ? 2 : 4)};
  margin: 0;
  width: 1px;
`;

const StyledShortcutLabel = styled.div<{
  variant: ButtonVariant;
  accent: ButtonAccent;
}>`
  color: ${({ theme, variant, accent }) => {
    switch (accent) {
      case 'blue':
        return theme.border.color.blue;
      case 'danger':
        return variant === 'primary'
          ? theme.border.color.danger
          : theme.color.red40;
      default:
        return theme.font.color.light;
    }
  }};
  font-weight: ${({ theme }) => theme.font.weight.medium};
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
}) => (
  <>
    <StyledSeparator buttonSize={size} accent={accent} />
    <StyledShortcutLabel variant={variant} accent={accent}>
      {hotkeys.join(getOsShortcutSeparator())}
    </StyledShortcutLabel>
  </>
);
