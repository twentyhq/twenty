import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { mediaUp } from '@/tokens';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { WindowBar } from './window-bar';

const FrameRoot = styled.div`
  align-items: stretch;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

// The frame fills its host — the host's scene box owns the window
// geometry (single source: APP_PREVIEW_STAGE.windowScene; the old site's
// redundant aspect-ratio was ratified out). compact lets a fluid scene
// reflow the board full-bleed; the default centers under the scene cap.
// floatingShadow is the product hero's downward-biased presentation.
const Shell = styled.div<{ $compact: boolean; $floatingShadow: boolean }>`
  background-color: ${THEME_LIGHT.background.primary};
  background-image: url('${APP_PREVIEW_STAGE.frame.noiseImageUrl}');
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${APP_PREVIEW_STAGE.frame.borderRadiusPx}px;
  box-shadow: ${({ $floatingShadow }) =>
    $floatingShadow
      ? APP_PREVIEW_STAGE.shadow.mobileFloating
      : APP_PREVIEW_STAGE.shadow.mobileResting};
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: ${({ $compact }) =>
    $compact ? 'none' : `${APP_PREVIEW_STAGE.frame.maxWidthPx}px`};
  overflow: hidden;
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    box-shadow: ${({ $floatingShadow }) =>
      $floatingShadow
        ? APP_PREVIEW_STAGE.shadow.floating
        : APP_PREVIEW_STAGE.shadow.resting};
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
`;

// The static product frame: the non-interactive presentation the
// product pages mount (the home hero uses AppWindow).
export function ProductFrame({
  children,
  compact = false,
  floatingShadow = false,
}: {
  children: ReactNode;
  compact?: boolean;
  floatingShadow?: boolean;
}) {
  return (
    <FrameRoot>
      <Shell $compact={compact} $floatingShadow={floatingShadow}>
        <WindowBar />
        <Content>{children}</Content>
      </Shell>
    </FrameRoot>
  );
}
