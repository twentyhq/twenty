import { styled } from '@linaria/react';
import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/halftone-image-backdrop';

import { MONOLITH_VISUAL } from './monolith-visual-config';

import { color, mediaUp } from '@/tokens';

const DESKTOP_PATH =
  'M672 395.498V701a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h664a4 4 0 0 1 4 4v65.155c0 2.363-.837 4.65-2.361 6.454l-23.603 27.936a10 10 0 0 0-2.362 6.453v242.614c0 2.245.756 4.424 2.145 6.188l24.036 30.51a10 10 0 0 1 2.145 6.188';

const MOBILE_PATH =
  'M360 214.218v165.689a2.093 2.093 0 0 1-2.093 2.093H2.093A2.093 2.093 0 0 1 0 379.907V2.093C0 .937.937 0 2.093 0h355.814C359.063 0 360 .937 360 2.093v35.463a5.23 5.23 0 0 1-1.217 3.355l-12.741 15.252a5.23 5.23 0 0 0-1.216 3.354v131.624a5.23 5.23 0 0 0 1.104 3.215l12.966 16.646a5.24 5.24 0 0 1 1.104 3.216';

const svgMask = (path: string, width: number, height: number): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(path)}' fill='black'/%3E%3C/svg%3E")`;

// Verbatim port of the old site's masked stage (the WebGL monolith arrives
// with the visual-runtime port). One deliberate fix kept from review:
// below md the old site stretched the phone mask across the full width
// (smeared notch on tablets); the stacked stage holds the authored aspect
// ratio instead, capped and centered.
const MaskedStage = styled.div`
  aspect-ratio: 360 / 382;
  background-color: ${color('black')};
  isolation: isolate;
  margin-inline: auto;
  mask-image: ${svgMask(MOBILE_PATH, 360, 382)};
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  max-width: 480px;
  width: 100%;

  ${mediaUp('md')} {
    aspect-ratio: auto;
    height: 100%;
    margin-inline: 0;
    mask-image: ${svgMask(DESKTOP_PATH, 672, 705)};
    max-width: none;
  }
`;

export function ProblemVisual() {
  return (
    <MaskedStage aria-hidden data-illustration="monolith">
      <HalftoneImageBackdrop
        imageUrl={MONOLITH_VISUAL.imageUrl}
        settings={MONOLITH_VISUAL.settings}
      />
    </MaskedStage>
  );
}
