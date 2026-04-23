'use client';

import { WebGlMount } from '@/lib/visual-runtime';
import { Hourglass } from '@/sections/Testimonials/visuals/Hourglass';
import { Partner } from '@/sections/Testimonials/visuals/Partner';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

/**
 * Reserves the testimonials visual slot's footprint in the surrounding
 * grid so the carousel layout never reflows as the WebGL scene goes
 * through its lifecycle (viewport gate → context-budget reservation →
 * GLB fetch → geometry parse → canvas mount). Without this, the slot
 * would collapse to ~1px until the inner canvas finally rendered, then
 * snap to its full size and shift everything below it.
 *
 * The dimensions match the design spec for the hourglass / partner-quote
 * visual on home and partners pages — they are not theme tokens because
 * this is a single, fixed product asset, not a reusable shape.
 */
const TestimonialsVisualFrame = styled.div`
  background-color: transparent;
  border-radius: ${theme.radius(1)};
  height: 279px;
  overflow: hidden;
  position: relative;
  width: 198px;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 476px;
    width: 336px;
  }
`;

export function MountedTestimonialsHomeVisual() {
  return (
    <TestimonialsVisualFrame>
      <WebGlMount>
        <Hourglass />
      </WebGlMount>
    </TestimonialsVisualFrame>
  );
}

export function MountedTestimonialsPartnerVisual() {
  return (
    <TestimonialsVisualFrame>
      <WebGlMount>
        <Partner />
      </WebGlMount>
    </TestimonialsVisualFrame>
  );
}
