import { type ReactElement } from 'react';
import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';

const StyledContainer = styled.div`
  border-radius: ${themeVar.border.radius.sm};
  border: 1px solid ${themeVar.border.color.medium};
  background: ${themeVar.background.transparent.secondary};
  display: flex;
  justify-content: space-between;
  padding: ${themeVar.spacing[3]};
  gap: ${themeVar.spacing[3]};
`;

const StyledCommandContain = styled.div`
  font-family: ${themeVar.code.font.family};
`;

const StyledButtonContainer = styled.div`
  display: flex;
`;

const StyledLineContainer = styled.div``;

const StyledLineStartSpan = styled.span`
  color: ${themeVar.code.text.orange};
`;

const StyledLineSpan = styled.span`
  color: ${themeVar.code.text.green};
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
