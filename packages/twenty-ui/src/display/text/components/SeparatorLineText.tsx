import React, { useContext } from 'react';
import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledContainer = styled.div<{ theme: ThemeType }>`
  display: flex;
  align-items: center;
  width: 100%;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.extraLight};

  &:before,
  &:after {
    content: '';
    height: 1px;
    flex-grow: 1;
    background: ${({ theme }) => theme.background.transparent.light};
  }

  &:before {
    margin: 0 ${({ theme }) => theme.spacing(4)} 0 0;
  }
  &:after {
    margin: 0 0 0 ${({ theme }) => theme.spacing(4)};
  }
`;

export const SeparatorLineText = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { theme } = useContext(ThemeContext);

  return <StyledContainer theme={theme}>{children}</StyledContainer>;
};
