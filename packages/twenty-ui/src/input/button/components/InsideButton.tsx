import { useTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import React from 'react';

export type InsideButtonProps = {
  className?: string;
  Icon?: IconComponent;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

const StyledButton = styled.button`
  align-items: center;
  border: none;
  background-color: transparent;
  border-radius: var(--border-radius-xs);
  color: var(--font-color-tertiary);
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex-direction: row;
  height: 20px;
  justify-content: center;
  padding: 0;
  white-space: nowrap;
  min-width: 20px;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: var(--background-transparent-light);
  }
`;

export const InsideButton = ({
  className,
  Icon,
  onClick,
  disabled = false,
}: InsideButtonProps) => {
  const theme = useTheme();

  return (
    <StyledButton className={className} onClick={onClick} disabled={disabled}>
      {Icon && <Icon size={theme.icon.size.sm} />}
    </StyledButton>
  );
};
