import { IllustrationMount } from '@/illustrations';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  background-color: ${theme.colors.secondary.background[100]};
  border-radius: ${theme.radius(1)};
  height: 462px;
  margin-top: ${theme.spacing(6)};
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    height: 360px;
  }
`;

export function PartnerVisual() {
  return (
    <StyledContainer>
      <IllustrationMount illustration="heroPartnerHalftone" />
    </StyledContainer>
  );
}
