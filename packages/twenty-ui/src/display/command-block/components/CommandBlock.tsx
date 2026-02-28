import { type ReactElement } from 'react';
import { styled } from '@linaria/react';
import { theme } from '@ui/theme';

const StyledContainer = styled.div`
  border-radius: ${theme.border.radius.sm};
  border: 1px solid ${theme.border.color.medium};
  background: ${theme.background.transparent.secondary};
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing[3]};
  gap: ${theme.spacing[3]};
`;

const StyledCommandContain = styled.div`
  font-family: ${theme.code.font.family};
`;

const StyledButtonContainer = styled.div`
  display: flex;
`;

const StyledLineContainer = styled.div``;

const StyledLineStartSpan = styled.span`
  color: ${theme.code.text.orange};
`;

const StyledLineSpan = styled.span`
  color: ${theme.code.text.green};
`;

type CommandBlockProps = {
  commands: string[];
  button?: ReactElement;
};

export const CommandBlock = ({ commands, button }: CommandBlockProps) => {
  return (
    <StyledContainer>
      <StyledCommandContain>
        <>
          {commands.map((line, i) => (
            <StyledLineContainer key={i}>
              <StyledLineStartSpan>{'> '}</StyledLineStartSpan>
              <StyledLineSpan>{line}</StyledLineSpan>
            </StyledLineContainer>
          ))}
        </>
      </StyledCommandContain>
      {button && <StyledButtonContainer>{button}</StyledButtonContainer>}
    </StyledContainer>
  );
};
