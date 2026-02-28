import { styled } from '@linaria/react';
import { useContext } from 'react';

import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledEditorHeader = styled.div<{ theme: ThemeType }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  padding: ${({ theme }) => `0 ${theme.spacing(2)}`};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  justify-content: space-between;
`;

const StyledElementContainer = styled.div<{ theme: ThemeType }>`
  align-content: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledEditorHeader theme={theme}>
      <StyledElementContainer theme={theme}>
        {leftNodes &&
          leftNodes.map((leftButton, index) => {
            return <div key={`left-${index}`}>{leftButton}</div>;
          })}
        {title}
      </StyledElementContainer>
      <StyledElementContainer theme={theme}>
        {rightNodes &&
          rightNodes.map((rightButton, index) => {
            return <div key={`right-${index}`}>{rightButton}</div>;
          })}
      </StyledElementContainer>
    </StyledEditorHeader>
  );
};
