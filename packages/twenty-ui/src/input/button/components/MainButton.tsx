import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import React, { type FunctionComponent } from 'react';

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
      return 'var(--background-secondary)';
    }

    switch (variant) {
      case 'primary':
        return 'var(--background-primary-inverted)';
      case 'secondary':
        return 'var(--background-primary)';
      default:
        return 'var(--background-primary)';
    }
  }};
  border: 1px solid;
  border-color: ${({ disabled, variant }) => {
    if (disabled === true) {
      return 'var(--background-transparent-lighter)';
    }

    switch (variant) {
      case 'primary':
        return 'var(--background-transparent-strong)';
      case 'secondary':
        return 'var(--border-color-medium)';
      default:
        return 'var(--background-primary)';
    }
  }};
  border-radius: var(--border-radius-md);
  ${({ disabled }) => {
    if (disabled === true) {
      return '';
    }

    return `box-shadow: var(--box-shadow-light);`;
  }}
  color: ${({ variant, disabled }) => {
    if (disabled === true) {
      return 'var(--font-color-light)';
    }

    switch (variant) {
      case 'primary':
        return 'var(--font-color-inverted)';
      case 'secondary':
        return 'var(--font-color-primary)';
      default:
        return 'var(--font-color-primary)';
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-semi-bold);
  gap: var(--spacing-2);
  justify-content: center;
  outline: none;
  padding: var(--spacing-2) var(--spacing-3);
  max-height: var(--spacing-8);
  width: ${({ fullWidth, width }) =>
    fullWidth ? '100%' : width ? `${width}px` : 'auto'};
  ${({ variant, disabled }) => {
    switch (variant) {
      case 'secondary':
        return `
          &:hover {
            background: var(--background-tertiary);
          }
        `;
      default:
        return `
          &:hover {
            background: ${
              !disabled
                ? 'var(--background-primary-inverted-hover)'
                : 'var(--background-secondary)'
            };};
          }
        `;
    }
  }};
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
  const theme = useTheme();
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
