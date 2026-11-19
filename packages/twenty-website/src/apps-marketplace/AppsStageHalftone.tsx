'use client';

import { styled } from '@linaria/react';

import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { color, mediaUp } from '@/tokens';

import { APPS_STAGE_HALFTONE } from './apps-stage-halftone-config';

// PROTOTYPE (?direction=e): Twenty's own halftone behind the hero, fixed to
// the page. It dissolves at its edges and stays dim under the copy.
const Shell = styled.div`
  /* Sits in the ring's middle, below the copy. */
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
  top: 34%;
  transform: translateX(-50%);
  width: 160%;

  ${mediaUp('md')} {
    width: 1100px;
  }
`;

export function AppsStageHalftone() {
  return (
    <Shell aria-hidden data-illustration="apps-keycap">
      <HalftoneModel
        modelUrl={APPS_STAGE_HALFTONE.modelUrl}
        settings={APPS_STAGE_HALFTONE.settings}
      />
    </Shell>
  );
}
