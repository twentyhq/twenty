import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';
import { type ComponentProps, type MouseEvent } from 'react';

export type LightIconButtonAccent = 'secondary' | 'tertiary';
export type LightIconButtonSize = 'small' | 'medium';

export type LightIconButtonProps = {
  className?: string;
  testId?: string;
  Icon?: IconComponent;
  title?: string;
  size?: LightIconButtonSize;
  accent?: LightIconButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & Pick<ComponentProps<'button'>, 'aria-label' | 'title'>;

const StyledButton = styled.button<
  Pick<LightIconButtonProps, 'accent' | 'active' | 'size' | 'focus'>
>`
  align-items: center;
  background: transparent;
  border: none;

  border: ${({ disabled, theme, focus }) =>
    !disabled && focus ? `1px solid ${theme.color.blue}` : 'none'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ disabled, theme, focus }) =>
    !disabled && focus ? `0 0 0 3px ${theme.color.blue3}` : 'none'};
  color: ${({ theme, accent, active, disabled, focus }) => {
    switch (accent) {
      case 'secondary':
        return active || focus
          ? theme.color.blue
          : !disabled
            ? theme.font.color.secondary
            : theme.font.color.extraLight;
      case 'tertiary':
        return active || focus
          ? theme.color.blue
          : !disabled
            ? theme.font.color.tertiary
            : theme.font.color.extraLight;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ size, theme }) =>
    size === 'small' ? theme.spacing(6) : theme.spacing(8)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
  transition: background 0.1s ease;

  white-space: nowrap;
  width: ${({ size, theme }) =>
    size === 'small' ? theme.spacing(6) : theme.spacing(8)};
  min-width: ${({ size, theme }) =>
    size === 'small' ? theme.spacing(6) : theme.spacing(8)};

  &:hover {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.light : 'transparent'};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({ theme, disabled }) =>
      !disabled ? theme.background.transparent.medium : 'transparent'};
  }
`;

export const LightIconButton = ({
  'aria-label': ariaLabel,
  className,
  testId,
  Icon,
  active = false,
  size = 'small',
  accent = 'secondary',
  disabled = false,
  focus = false,
  onClick,
  title,
}: LightIconButtonProps) => {
  const theme = useTheme();

  return (
    <StyledButton
      data-testid={testId}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      focus={focus && !disabled}
      accent={accent}
      className={className}
      size={size}
      active={active}
      title={title}
    >
      {Icon && (
        <Icon
          size={size === 'medium' ? theme.icon.size.md : theme.icon.size.sm}
        />
      )}
    </StyledButton>
  );
};
