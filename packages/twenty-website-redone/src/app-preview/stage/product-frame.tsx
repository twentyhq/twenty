import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { mediaUp } from '@/tokens';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { WindowBar } from './window-bar';

const FrameRoot = styled.div`
  align-items: stretch;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

// The frame fills its host: the hero's stage owns the life-size window
// geometry; product surfaces can host it in fluid boxes later.
const Shell = styled.div`
  background-color: ${APP_PREVIEW_THEME.background.primary};
  background-image: url('${APP_PREVIEW_STAGE.frame.noiseImageUrl}');
  border: 1px solid ${APP_PREVIEW_THEME.border.color.medium};
  border-radius: ${APP_PREVIEW_STAGE.frame.borderRadiusPx}px;
  box-shadow: ${APP_PREVIEW_STAGE.shadow.mobileResting};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    box-shadow: ${APP_PREVIEW_STAGE.shadow.resting};
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
`;

// The static product frame (the windowed/draggable mode lands commit 6).
export function ProductFrame({ children }: { children: ReactNode }) {
  return (
    <FrameRoot>
      <Shell>
        <WindowBar />
        <Content>{children}</Content>
      </Shell>
    </FrameRoot>
  );
}
