import { Image } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledHomeVisual = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  margin-top: ${theme.spacing(5)};
  position: relative;
  right: calc(${theme.spacing(2)} - ${theme.spacing(6)});
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 500px;
    margin-top: ${theme.spacing(17.5)};
    overflow: hidden;
    right: 0;
  }
`;

const StyledBackgroundImage = styled(Image)`
  grid-area: 1 / 1;
  justify-self: end;
  width: 98%;

  @media (min-width: ${theme.breakpoints.md}px) {
    width: 850px;
  }
`;

const StyledForegroundImage = styled(Image)`
  grid-area: 1 / 1;
  justify-self: end;
  margin-right: ${theme.spacing(6.5)};
  margin-top: ${theme.spacing(20)};
  width: 98%;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    justify-self: center;
    margin-right: ${theme.spacing(40)};
    margin-top: ${theme.spacing(17.5)};
    width: 800px;
  }
`;

export function HomeVisual() {
  return (
    <StyledHomeVisual>
      <StyledBackgroundImage src="/images/home/hero/background.png" alt="" />
      <StyledForegroundImage src="/images/home/hero/foreground.png" alt="" />
    </StyledHomeVisual>
  );
}
