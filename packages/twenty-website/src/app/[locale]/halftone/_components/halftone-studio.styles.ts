import { LocalizedLink } from '@/lib/i18n';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const DESKTOP_CONTROLS_PANEL_WIDTH = 320;
const DESKTOP_CONTROLS_PANEL_OFFSET = 20;
const DESKTOP_CONTROLS_PANEL_FOOTPRINT =
  DESKTOP_CONTROLS_PANEL_WIDTH + DESKTOP_CONTROLS_PANEL_OFFSET;

export const StudioShell = styled.div<{ $background: string }>`
  background: ${(props) => props.$background};
  /* Full-screen tool: track the visible viewport so the bottom controls bar
   * is reachable on mobile Safari (where 100vh extends behind the URL bar). */
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

export const ContentRegion = styled.div<{ $panelOpen: boolean }>`
  height: 100%;
  margin-right: auto;
  position: relative;
  transition: width 0.18s ease;
  width: ${(props) =>
    props.$panelOpen
      ? `calc(100% - ${DESKTOP_CONTROLS_PANEL_FOOTPRINT}px)`
      : '100%'};

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    width: 100%;
  }
`;

export const CanvasLayer = styled.div`
  height: 100%;
  width: 100%;
`;

export const LogoLink = styled(LocalizedLink)`
  display: grid;
  left: 24px;
  position: absolute;
  top: 24px;
  z-index: 2;
`;

export const Hint = styled.div<{ $tone: 'dark' | 'light'; $visible: boolean }>`
  color: ${(props) =>
    props.$tone === 'dark'
      ? 'rgba(255, 255, 255, 0.34)'
      : 'rgba(0, 0, 0, 0.3)'};
  font-family: ${theme.font.family.mono};
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

export const Status = styled.div<{
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
  font-family: ${theme.font.family.mono};
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

export const ControlsPositioner = styled.div`
  align-items: flex-start;
  bottom: 20px;
  display: flex;
  height: calc(100vh - 40px);
  height: calc(100dvh - 40px);
  justify-content: flex-end;
  pointer-events: none;
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 3;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    bottom: 16px;
    height: 48vh;
    left: 16px;
    right: 16px;
    top: auto;
  }
`;

export const ControlsPanelFrame = styled.div<{ $visible: boolean }>`
  height: ${(props) => (props.$visible ? '100%' : 'auto')};
  pointer-events: auto;
  @media (max-width: ${theme.breakpoints.md - 1}px) {
    width: ${(props) => (props.$visible ? '100%' : 'auto')};
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;
