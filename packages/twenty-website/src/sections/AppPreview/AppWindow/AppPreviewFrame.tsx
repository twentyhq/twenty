'use client';

import { styled } from '@linaria/react';
import type { ReactNode } from 'react';
import { theme } from '@/theme';

import { VISUAL_TOKENS } from '../Shared/utils/app-preview-tokens';
import { WINDOW_SHADOWS } from '../Shared/utils/window-shadows';
import { AppWindow } from './AppWindow';
import { MacWindowBar } from './MacWindowBar';

export type AppPreviewFrameMode = 'static' | 'windowed';

const APP_PREVIEW_FRAME_MAX_WIDTH = 1040;
const APP_PREVIEW_FRAME_ASPECT_RATIO = '1280 / 832';

const StaticFrameRoot = styled.div`
  align-items: stretch;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

// compact fills the (fixed-height, fluid-width) scene box without aspect-ratio,
// so the board reflows instead of the whole window scaling with width.
// floatingShadow swaps the resting halo for a downward-biased shadow (product
// hero only), so the soft shadow drops below instead of haloing above the title.
const StaticShell = styled.div<{ $compact: boolean; $floatingShadow: boolean }>`
  aspect-ratio: ${({ $compact }) =>
    $compact ? 'auto' : APP_PREVIEW_FRAME_ASPECT_RATIO};
  background-color: ${VISUAL_TOKENS.background.primary};
  background-image: ${VISUAL_TOKENS.background.noisy};
  border: 1px solid ${VISUAL_TOKENS.border.color.medium};
  border-radius: 20px;
  box-shadow: ${({ $floatingShadow }) =>
    $floatingShadow
      ? WINDOW_SHADOWS.mobileFloating
      : WINDOW_SHADOWS.mobileResting};
  display: flex;
  flex-direction: column;
  height: ${({ $compact }) => ($compact ? '100%' : 'auto')};
  max-height: ${({ $compact }) => ($compact ? 'none' : '100%')};
  max-width: ${({ $compact }) =>
    $compact ? 'none' : `${APP_PREVIEW_FRAME_MAX_WIDTH}px`};
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    box-shadow: ${({ $floatingShadow }) =>
      $floatingShadow ? WINDOW_SHADOWS.floating : WINDOW_SHADOWS.resting};
  }
`;

const StaticContent = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
`;

type AppPreviewFrameProps = {
  children: ReactNode;
  compact?: boolean;
  floatingShadow?: boolean;
  mode: AppPreviewFrameMode;
};

export function AppPreviewFrame({
  children,
  compact = false,
  floatingShadow = false,
  mode,
}: AppPreviewFrameProps) {
  if (mode === 'windowed') {
    return <AppWindow>{children}</AppWindow>;
  }

  return (
    <StaticFrameRoot>
      <StaticShell $compact={compact} $floatingShadow={floatingShadow}>
        <MacWindowBar interactive={false} />
        <StaticContent>{children}</StaticContent>
      </StaticShell>
    </StaticFrameRoot>
  );
}
