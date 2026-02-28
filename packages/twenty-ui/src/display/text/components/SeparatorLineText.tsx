import { styled } from '@linaria/react';
import { theme } from '@ui/theme';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  font-size: ${theme.font.size.md};
  font-weight: ${theme.font.weight.semiBold};
  color: ${theme.font.color.extraLight};

  &:before,
  &:after {
    content: '';
    height: 1px;
    flex-grow: 1;
    background: ${theme.background.transparent.light};
  }

  &:before {
    margin: 0 ${theme.spacing[4]} 0 0;
  }
  &:after {
    margin: 0 0 0 ${theme.spacing[4]};
  }
`;

export const SeparatorLineText = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <StyledContainer>{children}</StyledContainer>;
};
