'use client';

import { styled } from '@linaria/react';

import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { color, mediaUp } from '@/tokens';

import { PARTNERS_STAGE_CRAFT_HALFTONE } from './partners-stage-craft-halftone';

// PROTOTYPE (?direction=e): Twenty's halftone in the ring's middle, dim and
// dissolving at its edges, as on /apps.
const Shell = styled.div`
  height: 70%;
  left: 50%;
  mask-image: radial-gradient(
    ellipse 50% 50% at 50% 50%,
    ${color('black')} 35%,
    transparent 75%
  );
  opacity: 0.4;
  pointer-events: none;
  position: absolute;
  top: 40%;
  transform: translateX(-50%);
  width: 160%;

  ${mediaUp('md')} {
    width: 1100px;
  }
`;

export function PartnersStageCraftHalftone() {
  return (
    <Shell aria-hidden data-illustration="partners-target">
      <HalftoneModel
        modelUrl={PARTNERS_STAGE_CRAFT_HALFTONE.modelUrl}
        settings={PARTNERS_STAGE_CRAFT_HALFTONE.settings}
      />
    </Shell>
  );
}
