import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Monolith from './monolith';

const DESKTOP_PATH =
  'M672 395.498V701a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h664a4 4 0 0 1 4 4v65.155c0 2.363-.837 4.65-2.361 6.454l-23.603 27.936a10 10 0 0 0-2.362 6.453v242.614c0 2.245.756 4.424 2.145 6.188l24.036 30.51a10 10 0 0 1 2.145 6.188';

const MOBILE_PATH =
  'M360 214.218v165.689a2.093 2.093 0 0 1-2.093 2.093H2.093A2.093 2.093 0 0 1 0 379.907V2.093C0 .937.937 0 2.093 0h355.814C359.063 0 360 .937 360 2.093v35.463a5.23 5.23 0 0 1-1.217 3.355l-12.741 15.252a5.23 5.23 0 0 0-1.216 3.354v131.624a5.23 5.23 0 0 0 1.104 3.215l12.966 16.646a5.24 5.24 0 0 1 1.104 3.216';

const desktopMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 672 705' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(DESKTOP_PATH)}' fill='black'/%3E%3C/svg%3E")`;

const mobileMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 382' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(MOBILE_PATH)}' fill='black'/%3E%3C/svg%3E")`;

const StyledVisual = styled.div`
  min-height: 382px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    min-height: 0;
  }
`;

const StyledMasked = styled.div`
  background-color: #1c1c1c;
  height: 100%;
  isolation: isolate;
  -webkit-mask-image: ${mobileMask};
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-image: ${mobileMask};
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    -webkit-mask-image: ${desktopMask};
    mask-image: ${desktopMask};
  }
`;

const StyledHalftoneLayer = styled.div`
  inset: 0;
  position: absolute;
`;

export function Visual() {
  return (
    <StyledVisual>
      <StyledMasked>
        <StyledHalftoneLayer>
          <Monolith />
        </StyledHalftoneLayer>
      </StyledMasked>
    </StyledVisual>
  );
}
