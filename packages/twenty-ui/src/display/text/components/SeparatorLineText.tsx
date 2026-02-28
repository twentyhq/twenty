import { styled } from '@linaria/react';
import { themeVar } from '@ui/theme';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  font-size: ${themeVar.font.size.md};
  font-weight: ${themeVar.font.weight.semiBold};
  color: ${themeVar.font.color.extraLight};

  &:before,
  &:after {
    content: '';
    height: 1px;
    flex-grow: 1;
    background: ${themeVar.background.transparent.light};
  }

  &:before {
    margin: 0 ${themeVar.spacing[4]} 0 0;
  }
  &:after {
    margin: 0 0 0 ${themeVar.spacing[4]};
  }
`;

export const SeparatorLineText = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <StyledContainer>{children}</StyledContainer>;
};
