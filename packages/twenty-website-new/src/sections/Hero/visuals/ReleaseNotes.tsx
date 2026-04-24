'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { Milestone } from './Milestone';

const RELEASE_NOTES_SETTINGS = {
  animation: {
    hoverLightEnabled: true,
    hoverLightIntensity: 1.2,
    hoverLightRadius: 0.45,
  },
  background: {
    color: '#777777',
    transparent: false,
  },
  halftone: {
    dashColor: '#F3F3F3',
    hoverDashColor: '#F3F3F3',
    imageContrast: 1,
    power: -0.07,
    scale: 17.8,
    toneTarget: 'light' as const,
    width: 0.46,
  },
};

const VisualContainer = styled.div`
  height: 462px;
  margin-top: ${theme.spacing(6)};
  width: 100%;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    height: 360px;
  }
`;

export function ReleaseNotes() {
  return (
    <VisualContainer
      style={{ backgroundColor: RELEASE_NOTES_SETTINGS.background.color }}
    >
      <Milestone settings={RELEASE_NOTES_SETTINGS} />
    </VisualContainer>
  );
}
