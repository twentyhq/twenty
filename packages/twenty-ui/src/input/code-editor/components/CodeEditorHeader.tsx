import { styled } from '@linaria/react';

import { themeVar } from '@ui/theme';

const StyledEditorHeader = styled.div`
  align-items: center;
  background-color: ${themeVar.background.transparent.lighter};
  color: ${themeVar.font.color.tertiary};
  font-weight: ${themeVar.font.weight.medium};
  display: flex;
  height: ${themeVar.spacing[10]};
  padding: 0 ${themeVar.spacing[2]};
  border: 1px solid ${themeVar.border.color.medium};
  border-top-left-radius: ${themeVar.border.radius.sm};
  border-top-right-radius: ${themeVar.border.radius.sm};
  justify-content: space-between;
`;

const StyledElementContainer = styled.div`
  align-content: flex-end;
  display: flex;
  gap: ${themeVar.spacing[2]};
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
