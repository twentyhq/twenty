import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComponent } from '@ui/display';

const StyledIconButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.color.blue};
  border: none;

  border-radius: 50%;
  color: ${({ theme }) => theme.font.color.inverted};

  cursor: pointer;
  display: flex;
  height: 20px;

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
  width: 20px;
`;

type RoundedIconButtonProps = {
  Icon: IconComponent;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const RoundedIconButton = ({
  Icon,
  onClick,
  disabled,
  className,
}: RoundedIconButtonProps) => {
  const theme = useTheme();

  return (
    <StyledIconButton className={className} {...{ disabled, onClick }}>
      {<Icon size={theme.icon.size.md} />}
    </StyledIconButton>
  );
};
