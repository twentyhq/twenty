import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, themeVar } from '@ui/theme';
import { type ComponentProps, type MouseEvent, useContext } from 'react';

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

  border: ${({ disabled, focus }) =>
    !disabled && focus ? `1px solid ${themeVar.color.blue}` : 'none'};
  border-radius: ${themeVar.border.radius.sm};
  box-shadow: ${({ disabled, focus }) =>
    !disabled && focus ? `0 0 0 3px ${themeVar.color.blue3}` : 'none'};
  color: ${({ accent, active, disabled, focus }) => {
    switch (accent) {
      case 'secondary':
        return active || focus
          ? themeVar.color.blue
          : !disabled
            ? themeVar.font.color.secondary
            : themeVar.font.color.extraLight;
      case 'tertiary':
        return active || focus
          ? themeVar.color.blue
          : !disabled
            ? themeVar.font.color.tertiary
            : themeVar.font.color.extraLight;
    }
    return '';
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${themeVar.font.family};
  font-weight: ${themeVar.font.weight.regular};
  gap: ${themeVar.spacing[1]};
  height: ${({ size }) =>
    size === 'small' ? themeVar.spacing[6] : themeVar.spacing[8]};
  justify-content: center;
  padding: ${themeVar.spacing[1]};
  transition: background 0.1s ease;

  white-space: nowrap;
  width: ${({ size }) =>
    size === 'small' ? themeVar.spacing[6] : themeVar.spacing[8]};
  min-width: ${({ size }) =>
    size === 'small' ? themeVar.spacing[6] : themeVar.spacing[8]};

  &:hover {
    background: ${({ disabled }) =>
      !disabled ? themeVar.background.transparent.light : 'transparent'};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({ disabled }) =>
      !disabled ? themeVar.background.transparent.medium : 'transparent'};
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
  const { theme } = useContext(ThemeContext);

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
