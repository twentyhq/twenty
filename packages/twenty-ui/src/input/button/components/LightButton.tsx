import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { type MouseEvent } from 'react';

export type LightButtonAccent = 'secondary' | 'tertiary';

export type LightButtonProps = {
  className?: string;
  Icon?: IconComponent;
  title?: string;
  accent?: LightButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  type?: React.ComponentProps<'button'>['type'];
};

const StyledButton = styled.button<
  Pick<LightButtonProps, 'accent' | 'active' | 'focus'>
>`
  align-items: center;
  background: transparent;
  border: ${({ focus }) =>
    focus ? `1px solid var(--border-color-blue)` : 'none'};

  border-radius: var(--border-radius-sm);
  box-shadow: ${({ focus }) =>
    focus ? `0 0 0 3px var(--color-blue10)` : 'none'};
  color: ${({ accent, active, disabled, focus }) => {
    switch (accent) {
      case 'secondary':
        return active || focus
          ? 'var(--border-color-blue)'
          : !disabled
            ? 'var(--font-color-secondary)'
            : 'var(--font-color-extra-light)';
      case 'tertiary':
        return active || focus
          ? 'var(--border-color-blue)'
          : !disabled
            ? 'var(--font-color-tertiary)'
            : 'var(--font-color-extra-light)';
      default:
        return 'var(--font-color-light)';
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-regular);
  gap: var(--spacing-1);
  height: 24px;
  padding: 0 var(--spacing-2);

  transition: background 0.1s ease;

  white-space: nowrap;

  &:hover {
    background: ${({ disabled }) =>
      !disabled ? 'var(--background-transparent-light)' : 'transparent'};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({ disabled }) =>
      !disabled ? 'var(--background-transparent-medium)' : 'transparent'};
  }
`;

export const LightButton = ({
  className,
  Icon,
  title,
  active = false,
  accent = 'secondary',
  disabled = false,
  focus = false,
  type = 'button',
  onClick,
}: LightButtonProps) => {
  const theme = useTheme();

  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled}
      focus={focus && !disabled}
      type={type}
      accent={accent}
      className={className}
      active={active}
    >
      {!!Icon && <Icon size={theme.icon.size.md} />}
      {title}
    </StyledButton>
  );
};
