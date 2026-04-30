import { LocalizedLink } from '@/lib/i18n';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ComponentType } from 'react';

type IconComponent =
  | ComponentType<{ size: number; fillColor: string }>
  | ComponentType<{ size: number; strokeColor: string }>;

interface IconButtonProps {
  icon: IconComponent;
  ariaLabel: string;
  borderColor: string;
  iconFillColor: string;
  iconSize: number;
  iconStrokeColor: string;
  size: number;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaExpanded?: boolean;
}

const iconButtonSurfaceStyles = `
  align-items: center;
  background: transparent;
  border-radius: ${theme.radius(2)};
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  margin: 0;
  padding: 0;
  text-decoration: none;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }

  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);

  &:hover {
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.96);
  }
`;

type SurfaceProps = {
  $borderColor: string;
  $size: number;
};

const StyledButton = styled.button<SurfaceProps>`
  ${iconButtonSurfaceStyles}
  border: 1px solid ${({ $borderColor }) => $borderColor};
  height: ${({ $size }) => `${$size}px`};
  width: ${({ $size }) => `${$size}px`};
`;

const StyledIconLink = styled(LocalizedLink)<SurfaceProps>`
  ${iconButtonSurfaceStyles}
  border: 1px solid ${({ $borderColor }) => $borderColor};
  color: inherit;
  height: ${({ $size }) => `${$size}px`};
  width: ${({ $size }) => `${$size}px`};
`;

export function IconButton({
  icon: Icon,
  ariaLabel,
  borderColor,
  iconFillColor,
  iconSize,
  iconStrokeColor,
  size,
  href,
  onClick,
  ariaExpanded,
}: IconButtonProps) {
  const icon = (
    <Icon
      aria-hidden="true"
      fillColor={iconFillColor}
      size={iconSize}
      strokeColor={iconStrokeColor}
    />
  );

  if (href !== undefined && href !== '') {
    return (
      <StyledIconLink
        $borderColor={borderColor}
        $size={size}
        aria-label={ariaLabel}
        href={href}
      >
        {icon}
      </StyledIconLink>
    );
  }

  return (
    <StyledButton
      $borderColor={borderColor}
      $size={size}
      aria-expanded={ariaExpanded}
      aria-label={ariaLabel}
      onClick={onClick}
      type="button"
    >
      {icon}
    </StyledButton>
  );
}
