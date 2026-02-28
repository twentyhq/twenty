import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { useContext } from 'react';

export type RoundedIconButtonSize = 'small' | 'medium';

const StyledIconButton = styled.button<{
  size: RoundedIconButtonSize;
  theme: ThemeType;
}>`
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledIconButton
      className={className}
      disabled={disabled}
      onClick={onClick}
      size={size}
      theme={theme}
    >
      <Icon size={theme.icon.size.md} />
    </StyledIconButton>
  );
};
