import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, type ThemeType } from '@ui/theme';
import React, { useContext } from 'react';

export type InsideButtonProps = {
  className?: string;
  Icon?: IconComponent;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

const StyledButton = styled.button<{ theme: ThemeType }>`
  align-items: center;
  border: none;
  background-color: transparent;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
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
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const InsideButton = ({
  className,
  Icon,
  onClick,
  disabled = false,
}: InsideButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledButton
      className={className}
      onClick={onClick}
      disabled={disabled}
      theme={theme}
    >
      {Icon && <Icon size={theme.icon.size.sm} />}
    </StyledButton>
  );
};
