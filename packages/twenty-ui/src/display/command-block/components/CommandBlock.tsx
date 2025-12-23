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
  font-family: 'DM Mono;
`;

const StyledButtonContainer = styled.div`
  display: flex;
`;

type CommandBlockProps = {
  commands: string[];
  button?: ReactElement;
};

export const CommandBlock = ({ commands, button }: CommandBlockProps) => {
  return (
    <StyledContainer>
      <StyledCommandContain>
        <pre style={{ margin: 0 }}>
          <code>
            {commands.map((line, i) => (
              <div key={i}>
                {/* eslint-disable-next-line @nx/workspace-no-hardcoded-colors */}
                <span style={{ color: '#d19a66' }}>{'> '}</span>
                {/* eslint-disable-next-line @nx/workspace-no-hardcoded-colors */}
                <span style={{ color: '#98C379' }}>{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </StyledCommandContain>
      {button && <StyledButtonContainer>{button}</StyledButtonContainer>}
    </StyledContainer>
  );
};
