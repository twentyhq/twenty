'use client';

import {
  HalftoneImageCanvas,
  type HalftoneStudioSettings,
} from '@/lib/halftone';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import {
  buildMilestoneSettings,
  MILESTONE_IMAGE_FIT,
  MILESTONE_IMAGE_URL,
  MILESTONE_INITIAL_POSE,
  MILESTONE_PREVIEW_DISTANCE,
  type MilestoneSettingsOverrides,
} from '../utils/milestone-config';

const StyledVisualMount = styled.div`
  background: transparent;
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type MilestoneProps = {
  imageUrl?: string;
  settings?: MilestoneSettingsOverrides;
  style?: CSSProperties;
};

export function Milestone({
  imageUrl = MILESTONE_IMAGE_URL,
  settings,
  style,
}: MilestoneProps) {
  const resolvedSettings: HalftoneStudioSettings =
    buildMilestoneSettings(settings);

  return (
    <StyledVisualMount
      aria-hidden
      style={{
        backgroundColor: resolvedSettings.background.color,
        ...style,
      }}
    >
      <HalftoneImageCanvas
        imageFit={MILESTONE_IMAGE_FIT}
        imageUrl={imageUrl}
        initialPose={MILESTONE_INITIAL_POSE}
        previewDistance={MILESTONE_PREVIEW_DISTANCE}
        settings={resolvedSettings}
      />
    </StyledVisualMount>
  );
}
