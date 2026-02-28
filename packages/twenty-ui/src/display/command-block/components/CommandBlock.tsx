import { useContext } from 'react';
import { styled } from '@linaria/react';
import type { ReactElement } from 'react';
import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledContainer = styled.div<{ theme: ThemeType }>`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.transparent.secondary};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledCommandContain = styled.div<{ theme: ThemeType }>`
  font-family: ${({ theme }) => theme.code.font.family};
`;

const StyledButtonContainer = styled.div`
  display: flex;
`;

const StyledLineContainer = styled.div``;

const StyledLineStartSpan = styled.span<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.code.text.orange};
`;

const StyledLineSpan = styled.span<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.code.text.green};
`;

type CommandBlockProps = {
  commands: string[];
  button?: ReactElement;
};

export const CommandBlock = ({ commands, button }: CommandBlockProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer theme={theme}>
      <StyledCommandContain theme={theme}>
        <>
          {commands.map((line, i) => (
            <StyledLineContainer key={i}>
              <StyledLineStartSpan theme={theme}>{'> '}</StyledLineStartSpan>
              <StyledLineSpan theme={theme}>{line}</StyledLineSpan>
            </StyledLineContainer>
          ))}
        </>
      </StyledCommandContain>
      {button && <StyledButtonContainer>{button}</StyledButtonContainer>}
    </StyledContainer>
  );
};
