import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, theme } from '@ui/theme';
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
      return theme.background.secondary;
    }

    switch (variant) {
      case 'primary':
        return theme.background.primaryInverted;
      case 'secondary':
        return theme.background.primary;
      default:
        return theme.background.primary;
    }
  }};
  border: 1px solid;
  border-color: ${({ disabled, variant }) => {
    if (disabled === true) {
      return theme.background.transparent.lighter;
    }

    switch (variant) {
      case 'primary':
        return theme.background.transparent.strong;
      case 'secondary':
        return theme.border.color.medium;
      default:
        return theme.background.primary;
    }
  }};
  border-radius: ${theme.border.radius.md};
  box-shadow: ${({ disabled }) => (disabled ? 'none' : theme.boxShadow.light)};
  color: ${({ variant, disabled }) => {
    if (disabled === true) {
      return theme.font.color.light;
    }

    switch (variant) {
      case 'primary':
        return theme.font.color.inverted;
      case 'secondary':
        return theme.font.color.primary;
      default:
        return theme.font.color.primary;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${theme.font.family};
  font-weight: ${theme.font.weight.semiBold};
  gap: ${theme.spacing[2]};
  justify-content: center;
  outline: none;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  max-height: ${theme.spacing[8]};
  width: ${({ fullWidth, width }) =>
    fullWidth ? '100%' : width ? `${width}px` : 'auto'};
  &:hover {
    background: ${({ variant, disabled }) => {
      switch (variant) {
        case 'secondary':
          return theme.background.tertiary;
        default:
          return !disabled
            ? theme.background.primaryInvertedHover
            : theme.background.secondary;
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
