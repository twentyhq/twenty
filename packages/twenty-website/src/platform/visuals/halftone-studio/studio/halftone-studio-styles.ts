import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n';
import { fontFamily, mediaUp } from '@/tokens';

const DESKTOP_CONTROLS_PANEL_WIDTH = 320;
const DESKTOP_CONTROLS_PANEL_OFFSET = 20;
const DESKTOP_CONTROLS_PANEL_FOOTPRINT =
  DESKTOP_CONTROLS_PANEL_WIDTH + DESKTOP_CONTROLS_PANEL_OFFSET;

const StudioShell = styled.div<{ $background: string }>`
  background: ${(props) => props.$background};
  /* Full-screen tool: track the visible viewport so the bottom controls bar
   * is reachable on mobile Safari (where 100vh extends behind the URL bar). */
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const ContentRegion = styled.div<{ $panelOpen: boolean }>`
  height: 100%;
  margin-right: auto;
  position: relative;
  transition: width 0.18s ease;
  width: 100%;

  ${mediaUp('md')} {
    width: ${(props) =>
      props.$panelOpen
        ? `calc(100% - ${DESKTOP_CONTROLS_PANEL_FOOTPRINT}px)`
        : '100%'};
  }
`;

const CanvasLayer = styled.div`
  height: 100%;
  width: 100%;
`;

const LogoLink = styled(LocalizedLink)`
  display: grid;
  left: 24px;
  position: absolute;
  top: 24px;
  z-index: 2;
`;

const Hint = styled.div<{ $tone: 'dark' | 'light'; $visible: boolean }>`
  color: ${(props) =>
    props.$tone === 'dark'
      ? 'rgba(255, 255, 255, 0.34)'
      : 'rgba(0, 0, 0, 0.3)'};
  font-family: ${fontFamily('mono')};
  font-size: 11px;
  left: 50%;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: none;
  position: absolute;
  top: 20px;
  transform: translateX(-50%);
  transition: opacity 0.3s ease;
  z-index: 1;
`;

const Status = styled.div<{
  $error: boolean;
  $tone: 'dark' | 'light';
  $visible: boolean;
}>`
  color: ${(props) => {
    if (props.$error) {
      return 'rgba(214, 66, 66, 0.92)';
    }

    return props.$tone === 'dark'
      ? 'rgba(255, 255, 255, 0.62)'
      : 'rgba(0, 0, 0, 0.55)';
  }};
  font-family: ${fontFamily('mono')};
  font-size: 11px;
  left: 50%;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: none;
  position: absolute;
  top: 44px;
  transform: translateX(-50%);
  transition: opacity 0.2s ease;
  z-index: 1;
`;

const ControlsPositioner = styled.div`
  align-items: flex-start;
  bottom: 16px;
  display: flex;
  height: 48vh;
  justify-content: flex-end;
  left: 16px;
  pointer-events: none;
  position: fixed;
  right: 16px;
  top: auto;
  z-index: 3;

  ${mediaUp('md')} {
    bottom: 20px;
    height: calc(100vh - 40px);
    height: calc(100dvh - 40px);
    left: auto;
    right: 20px;
    top: 20px;
  }
`;

const ControlsPanelFrame = styled.div<{ $visible: boolean }>`
  height: ${(props) => (props.$visible ? '100%' : 'auto')};
  pointer-events: auto;
  width: ${(props) => (props.$visible ? '100%' : 'auto')};

  ${mediaUp('md')} {
    width: auto;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

export const STUDIO_STYLES = {
  Shell: StudioShell,
  ContentRegion,
  CanvasLayer,
  LogoLink,
  Hint,
  Status,
  ControlsPositioner,
  ControlsPanelFrame,
  HiddenFileInput,
};
