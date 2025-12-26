import styled from '@emotion/styled';
import type { ReactElement } from 'react';

const StyledContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.transparent.secondary};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledCommandContain = styled.div`
  font-family: ${({ theme }) => theme.code.font.family};
`;

const StyledButtonContainer = styled.div`
  display: flex;
`;

const StyledLineContainer = styled.div``;

const StyledLineStartSpan = styled.span`
  color: ${({ theme }) => theme.code.text.orange};
`;

const StyledLineSpan = styled.span`
  color: ${({ theme }) => theme.code.text.green};
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
