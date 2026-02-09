import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';

export type RoundedIconButtonSize = 'small' | 'medium';

const StyledIconButton = styled.button<{ size: RoundedIconButtonSize }>`
  align-items: center;
  background: ${({ theme }) => theme.color.blue};
  border: none;
  border-radius: 50%;
  color: ${({ theme }) => theme.font.color.inverted};
  cursor: pointer;
  display: flex;
  height: ${({ size }) => (size === 'small' ? '20px' : '24px')};
  justify-content: center;
  outline: none;
  padding: 0;
  transition:
    color 0.1s ease-in-out,
    background 0.1s ease-in-out;

  &:disabled {
    background: ${({ theme }) => theme.background.quaternary};
    color: ${({ theme }) => theme.font.color.tertiary};
    cursor: default;
  }
  width: ${({ size }) => (size === 'small' ? '20px' : '24px')};
`;

type RoundedIconButtonProps = {
  Icon: IconComponent;
  size?: RoundedIconButtonSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const RoundedIconButton = ({
  Icon,
  onClick,
  disabled,
  className,
  size = 'small',
}: RoundedIconButtonProps) => {
  const theme = useTheme();

  return (
    <StyledIconButton
      className={className}
      disabled={disabled}
      onClick={onClick}
      size={size}
    >
      <Icon size={theme.icon.size.md} />
    </StyledIconButton>
  );
};
