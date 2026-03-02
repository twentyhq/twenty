import { type ReactElement } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';

const StyledContainer = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  border: 1px solid ${themeCssVariables.border.color.medium};
  background: ${themeCssVariables.background.transparent.secondary};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledCommandContain = styled.div`
  font-family: ${themeCssVariables.code.font.family};
`;

const StyledButtonContainer = styled.div`
  display: flex;
`;

const StyledLineContainer = styled.div``;

const StyledLineStartSpan = styled.span`
  color: ${themeCssVariables.code.text.orange};
`;

const StyledLineSpan = styled.span`
  color: ${themeCssVariables.code.text.green};
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
