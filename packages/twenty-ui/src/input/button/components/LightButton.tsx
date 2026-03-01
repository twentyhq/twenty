import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { type MouseEvent, useContext } from 'react';

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
    focus ? `1px solid ${themeCssVariables.color.blue}` : 'none'};

  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${({ focus }) =>
    focus ? `0 0 0 3px  ${themeCssVariables.color.blue3}` : 'none'};
  color: ${({ accent, active, disabled, focus }) => {
    switch (accent) {
      case 'secondary':
        return active || focus
          ? themeCssVariables.color.blue
          : !disabled
            ? themeCssVariables.font.color.secondary
            : themeCssVariables.font.color.extraLight;
      case 'tertiary':
        return active || focus
          ? themeCssVariables.color.blue
          : !disabled
            ? themeCssVariables.font.color.tertiary
            : themeCssVariables.font.color.extraLight;
    }
    return '';
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;

  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[2]};

  transition: background 0.1s ease;

  white-space: nowrap;

  &:hover {
    background: ${({ disabled }) =>
      !disabled
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${({ disabled }) =>
      !disabled
        ? themeCssVariables.background.transparent.medium
        : 'transparent'};
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
  const { theme } = useContext(ThemeContext);

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
