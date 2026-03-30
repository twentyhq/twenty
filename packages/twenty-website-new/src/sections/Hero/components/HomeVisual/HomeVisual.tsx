import { Image } from '@/design-system/components';
import type { ImageType } from '@/design-system/components/Image/types/Image';
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
    max-width: 850px;
    width: 100%;
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
    max-width: 800px;
    width: 100%;
  }
`;

type HomeVisualProps = {
  background: ImageType;
  foreground: ImageType;
};

export function HomeVisual({ background, foreground }: HomeVisualProps) {
  return (
    <StyledHomeVisual>
      <StyledBackgroundImage src={background.src} alt={background.alt} />
      <StyledForegroundImage src={foreground.src} alt={foreground.alt} />
    </StyledHomeVisual>
  );
}
