import { styled } from '@linaria/react';

const StyledEditorHeader = styled.div`
  align-items: center;
  background-color: var(--background-transparent-lighter);
  color: var(--font-color-tertiary);
  font-weight: var(--font-weight-medium);
  display: flex;
  height: var(--spacing-10);
  padding: 0 var(--spacing-2);
  border: 1px solid var(--border-color-medium);
  border-top-left-radius: var(--border-radius-sm);
  border-top-right-radius: var(--border-radius-sm);
  justify-content: space-between;
`;

const StyledElementContainer = styled.div`
  align-content: flex-end;
  display: flex;
  gap: var(--spacing-2);
`;

export type CoreEditorHeaderProps = {
  title?: string;
  leftNodes?: React.ReactNode[];
  rightNodes?: React.ReactNode[];
};

export const CoreEditorHeader = ({
  title,
  leftNodes,
  rightNodes,
}: CoreEditorHeaderProps) => {
  return (
    <StyledEditorHeader>
      <StyledElementContainer>
        {leftNodes &&
          leftNodes.map((leftButton, index) => {
            return <div key={`left-${index}`}>{leftButton}</div>;
          })}
        {title}
      </StyledElementContainer>
      <StyledElementContainer>
        {rightNodes &&
          rightNodes.map((rightButton, index) => {
            return <div key={`right-${index}`}>{rightButton}</div>;
          })}
      </StyledElementContainer>
    </StyledEditorHeader>
  );
};
