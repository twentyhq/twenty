import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, themeVar } from '@ui/theme';
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
      return themeVar.background.secondary;
    }

    switch (variant) {
      case 'primary':
        return themeVar.background.primaryInverted;
      case 'secondary':
        return themeVar.background.primary;
      default:
        return themeVar.background.primary;
    }
  }};
  border: 1px solid;
  border-color: ${({ disabled, variant }) => {
    if (disabled === true) {
      return themeVar.background.transparent.lighter;
    }

    switch (variant) {
      case 'primary':
        return themeVar.background.transparent.strong;
      case 'secondary':
        return themeVar.border.color.medium;
      default:
        return themeVar.background.primary;
    }
  }};
  border-radius: ${themeVar.border.radius.md};
  box-shadow: ${({ disabled }) =>
    disabled ? 'none' : themeVar.boxShadow.light};
  color: ${({ variant, disabled }) => {
    if (disabled === true) {
      return themeVar.font.color.light;
    }

    switch (variant) {
      case 'primary':
        return themeVar.font.color.inverted;
      case 'secondary':
        return themeVar.font.color.primary;
      default:
        return themeVar.font.color.primary;
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: ${themeVar.font.family};
  font-weight: ${themeVar.font.weight.semiBold};
  gap: ${themeVar.spacing[2]};
  justify-content: center;
  outline: none;
  padding: ${themeVar.spacing[2]} ${themeVar.spacing[3]};
  max-height: ${themeVar.spacing[8]};
  width: ${({ fullWidth, width }) =>
    fullWidth ? '100%' : width ? `${width}px` : 'auto'};
  &:hover {
    background: ${({ variant, disabled }) => {
      switch (variant) {
        case 'secondary':
          return themeVar.background.tertiary;
        default:
          return !disabled
            ? themeVar.background.primaryInvertedHover
            : themeVar.background.secondary;
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
