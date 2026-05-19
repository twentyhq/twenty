'use client';

import { WebGlMount } from '@/lib/visual-runtime';
import { Partner } from './Partner';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

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

export function MountedTestimonialsPartnerVisual() {
  return (
    <TestimonialsVisualFrame>
      <WebGlMount>
        <Partner />
      </WebGlMount>
    </TestimonialsVisualFrame>
  );
}
