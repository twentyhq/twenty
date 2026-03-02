import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import React, { type FunctionComponent, useContext } from 'react';

export type MainButtonVariant = 'primary' | 'secondary';

type Props = {
  title: string;
  fullWidth?: boolean;
  width?: number;
  variant?: MainButtonVariant;
  soon?: boolean;
} & React.ComponentProps<'button'>;

const StyledButton = styled.button<
  Pick<Props, 'fullWidth' | 'width' | 'variant'>
>`
  align-items: center;
  background: ${({ variant, disabled }) => {
    if (disabled === true) {
      return themeCssVariables.background.secondary;
    }

    switch (variant) {
      case 'primary':
        return themeCssVariables.background.primaryInverted;
      case 'secondary':
        return themeCssVariables.background.primary;
      default:
        return themeCssVariables.background.primary;
    }
  }};
  border: 1px solid;
  border-color: ${({ disabled, variant }) => {
    if (disabled === true) {
      return themeCssVariables.background.transparent.lighter;
    }

    switch (variant) {
      case 'primary':
        return themeCssVariables.background.transparent.strong;
      case 'secondary':
        return themeCssVariables.border.color.medium;
      default:
        return themeCssVariables.background.primary;
    }
  }};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${({ disabled }) =>
    disabled ? 'none' : themeCssVariables.boxShadow.light};
  color: ${({ variant, disabled }) => {
    if (disabled === true) {
      return themeCssVariables.font.color.light;
    }

    switch (variant) {
      case 'primary':
        return themeCssVariables.font.color.inverted;
      case 'secondary':
        return themeCssVariables.font.color.primary;
      default:
        return themeCssVariables.font.color.primary;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  outline: none;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  max-height: ${themeCssVariables.spacing[8]};
  width: ${({ fullWidth, width }) =>
    fullWidth ? '100%' : width ? `${width}px` : 'auto'};
  &:hover {
    background: ${({ variant, disabled }) => {
      switch (variant) {
        case 'secondary':
          return themeCssVariables.background.tertiary;
        default:
          return !disabled
            ? themeCssVariables.background.primaryInvertedHover
            : themeCssVariables.background.secondary;
      }
    }};
  }
`;

type MainButtonProps = Props & {
  Icon?: IconComponent | FunctionComponent<{ size: number }>;
};

export const MainButton = ({
  Icon,
  title,
  width,
  fullWidth = false,
  variant = 'primary',
  type,
  onClick,
  disabled,
  className,
}: MainButtonProps) => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledButton
      className={className}
      {...{ disabled, fullWidth, width, onClick, type, variant }}
    >
      {Icon && <Icon size={theme.icon.size.sm} />}
      {title}
    </StyledButton>
  );
};
