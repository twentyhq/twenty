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
const StaticShell = styled.div<{ $compact: boolean }>`
  aspect-ratio: ${({ $compact }) =>
    $compact ? 'auto' : APP_PREVIEW_FRAME_ASPECT_RATIO};
  background-color: ${VISUAL_TOKENS.background.primary};
  background-image: ${VISUAL_TOKENS.background.noisy};
  border: 1px solid ${VISUAL_TOKENS.border.color.medium};
  border-radius: 20px;
  box-shadow: ${WINDOW_SHADOWS.mobileResting};
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
    box-shadow: ${WINDOW_SHADOWS.resting};
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
  mode: AppPreviewFrameMode;
};

export function AppPreviewFrame({
  children,
  compact = false,
  mode,
}: AppPreviewFrameProps) {
  if (mode === 'windowed') {
    return <AppWindow>{children}</AppWindow>;
  }

  return (
    <StaticFrameRoot>
      <StaticShell $compact={compact}>
        <MacWindowBar interactive={false} />
        <StaticContent>{children}</StaticContent>
      </StaticShell>
    </StaticFrameRoot>
  );
}
