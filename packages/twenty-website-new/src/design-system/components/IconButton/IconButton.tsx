import type { ComponentType, CSSProperties } from 'react';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Link from 'next/link';

type IconButtonSurfaceStyle = CSSProperties & {
  '--icon-button-border-color': string;
  '--icon-button-size': string;
};

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

const StyledButton = styled.button`
  ${iconButtonSurfaceStyles}
  border: 1px solid var(--icon-button-border-color);
  height: var(--icon-button-size);
  width: var(--icon-button-size);
`;

const StyledIconLink = styled(Link)`
  ${iconButtonSurfaceStyles}
  border: 1px solid var(--icon-button-border-color);
  color: inherit;
  height: var(--icon-button-size);
  width: var(--icon-button-size);
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
      size={iconSize}
      strokeColor={iconStrokeColor}
      fillColor={iconFillColor}
      aria-hidden="true"
    />
  );

  const surfaceStyle: IconButtonSurfaceStyle = {
    '--icon-button-border-color': borderColor,
    '--icon-button-size': `${size}px`,
  };

  if (href !== undefined && href !== '') {
    return (
      <StyledIconLink
        aria-label={ariaLabel}
        href={href}
        style={surfaceStyle}
      >
        {icon}
      </StyledIconLink>
    );
  }

  return (
    <StyledButton
      type="button"
      aria-expanded={ariaExpanded}
      aria-label={ariaLabel}
      style={surfaceStyle}
      onClick={onClick}
    >
      {icon}
    </StyledButton>
  );
}
