import type { ComponentType } from "react";
import { theme } from "@/theme";
import { styled } from "@linaria/react";

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
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaExpanded?: boolean;
}

const StyledButton = styled.button<{ size: number; borderColor: string }>`
  align-items: center;
  background: transparent;
  border: 1px solid ${(p) => p.borderColor};
  border-radius: ${theme.radius(2)};
  cursor: pointer;
  display: inline-flex;
  height: ${(p) => p.size}px;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: ${(p) => p.size}px;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }

  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  &:hover {
    transform: scale(1.08); /* Apple-like slight growth */
  }

  &:active {
    transform: scale(0.96); /* Apple-like click shrink */
  }
`;

export function IconButton({
  icon: Icon,
  ariaLabel,
  borderColor,
  iconFillColor,
  iconSize,
  iconStrokeColor,
  size,
  onClick,
  ariaExpanded,
}: IconButtonProps) {
  return (
    <StyledButton
      type="button"
      size={size}
      borderColor={borderColor}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      onClick={onClick}
    >
      <Icon
        size={iconSize}
        strokeColor={iconStrokeColor}
        fillColor={iconFillColor}
        aria-hidden="true"
      />
    </StyledButton>
  );
}
