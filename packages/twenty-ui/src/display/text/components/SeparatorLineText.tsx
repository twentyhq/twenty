import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  color: ${themeCssVariables.font.color.extraLight};

  &:before,
  &:after {
    content: '';
    height: 1px;
    flex-grow: 1;
    background: ${themeCssVariables.background.transparent.light};
  }

  &:before {
    margin: 0 ${themeCssVariables.spacing[4]} 0 0;
  }
  &:after {
    margin: 0 0 0 ${themeCssVariables.spacing[4]};
  }
`;

export const SeparatorLineText = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <StyledContainer>{children}</StyledContainer>;
};
