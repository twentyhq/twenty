import { styled } from '@linaria/react';
import {
  type ButtonAccent,
  type ButtonSize,
  type ButtonVariant,
} from '@ui/input';
import { getOsShortcutSeparator } from '@ui/utilities';

const StyledSeparator = styled.div<{
  buttonSize: ButtonSize;
  accent: ButtonAccent;
}>`
  background: ${({ accent }) => {
    switch (accent) {
      case 'blue':
        return 'var(--border-color-blue)';
      case 'danger':
        return 'var(--border-color-danger)';
      default:
        return 'var(--font-color-light)';
    }
  }};
  height: ${({ buttonSize }) =>
    buttonSize === 'small' ? 'var(--spacing-2)' : 'var(--spacing-4)'};
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
        return 'var(--border-color-blue)';
      case 'danger':
        return variant === 'primary'
          ? 'var(--border-color-danger)'
          : 'var(--color-red40)';
      default:
        return 'var(--font-color-light)';
    }
  }};
  font-weight: var(--font-weight-medium);
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
