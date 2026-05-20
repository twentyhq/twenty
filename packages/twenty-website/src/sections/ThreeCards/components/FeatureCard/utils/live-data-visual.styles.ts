import { theme } from '@/theme';
import { styled } from '@linaria/react';

const APP_FONT = `'Inter', ${theme.font.family.sans}`;
export const SCENE_HEIGHT = 508;
export const SCENE_WIDTH = 411;
export const TABLE_PANEL_HOVER_SCALE = 1.012;
export const TABLER_STROKE = 1.65;
export const FILTER_ICON_STROKE = 1.33;
export const FILTER_ROW_GAP = 4;
export const BOB_READY_CURSOR_ROTATION = 135;
export const MARKER_CURSOR_HEIGHT = 32;
export const MARKER_CURSOR_WIDTH = 29;
export const BOB_MARKER_LEFT = 196;
export const BOB_MARKER_TOP = 372;
export const BOB_ARROW_LEFT_OFFSET = 20;
export const DEFAULT_ADD_FILTER_LEFTS = {
  docked: 152,
  parked: 276,
};

export const COLORS = {
  backdrop: '#1b1b1b',
  black: '#1f1f1f',
  bobCursor: '#EDB7FF',
  blue: '#1961ed',
  blueBorder: '#edf2fe',
  blueSurface: '#f5f9fd',
  green: '#18794e',
  greenSurface: '#ddf3e4',
  muted: '#999999',
  orange: '#ffb08d',
  purple: '#7869ff',
  text: '#333333',
  textLight: '#b3b3b3',
  textSecondary: '#666666',
  white: '#ffffff',
  yellow: '#fff6a5',
} as const;

export const VisualRoot = styled.div`
  background: ${COLORS.backdrop};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

export const SceneViewport = styled.div<{ $sceneScale: number }>`
  /*
   * Fixed 411 × 508 design box. The previous "width: 101%; top: 0; bottom: 0"
   * sizing made the viewport responsive AND we then applied a scale on top —
   * a double-responsive coupling that shrank the visual quadratically with
   * card width and made absolute-positioned children (TablePanel etc.) drift
   * around as the card resized. Locking the box to design size means inner
   * content lives in a stable 411 × 508 coordinate system; only the single
   * uniform scale changes with the card.
   */
  height: ${SCENE_HEIGHT}px;
  left: 50%;
  position: absolute;
  top: 0;
  transform: translateX(-50%) scale(${({ $sceneScale }) => $sceneScale});
  transform-origin: top center;
  width: ${SCENE_WIDTH}px;
`;

export const SceneFrame = styled.div`
  border-radius: 2px;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

export const SceneBackdrop = styled.div<{
  $backgroundImageRotationDeg?: number;
}>`
  background-color: ${COLORS.backdrop};
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

export const SceneContent = styled.div`
  inset: 16px 0 0;
  position: absolute;
  width: 100%;
`;

export const TablePanel = styled.div<{ $active?: boolean }>`
  backface-visibility: hidden;
  background: ${COLORS.white};
  border-top-left-radius: 8px;
  box-shadow: ${({ $active }) =>
    $active
      ? '0 0 0 1px rgba(241, 241, 241, 0.9), 0 14px 28px rgba(15, 23, 42, 0.08)'
      : '0 0 0 1px rgba(241, 241, 241, 0.9)'};
  contain: paint;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  height: 376px;
  bottom: -4px;
  overflow: hidden;
  position: absolute;
  right: 0px;
  transform: ${({ $active }) =>
    `translate3d(0, 0, 0) scale(${$active ? TABLE_PANEL_HOVER_SCALE : 1})`};
  transform-origin: bottom right;
  transition:
    box-shadow 260ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, box-shadow;
  width: 355px;
`;

export const ViewRow = styled.div`
  align-items: center;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  height: 40px;
  padding: 0 8px;
`;

export const ViewSwitcher = styled.div`
  align-items: center;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  gap: 4px;
  height: 24px;
  padding: 0 4px;
  transition: background-color 120ms ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

export const ViewSwitcherLeft = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  height: 100%;
`;

export const ViewSwitcherIcon = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

export const ViewLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

export const ViewDot = styled.div`
  background: ${COLORS.textLight};
  border-radius: 999px;
  height: 2px;
  width: 2px;
`;

export const ViewCount = styled.span`
  color: ${COLORS.textLight};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

export const ViewSwitcherChevron = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

export const FilterRow = styled.div`
  align-items: center;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  gap: ${FILTER_ROW_GAP}px;
  height: 48px;
  padding: 0 12px;
  position: relative;
`;

export const FilterChipMotion = styled.div<{
  $removing?: boolean;
  $visible: boolean;
}>`
  display: inline-flex;
  max-width: ${({ $visible }) => ($visible ? '172px' : '0')};
  opacity: ${({ $removing, $visible }) => ($visible || $removing ? 1 : 0)};
  overflow: ${({ $removing }) => ($removing ? 'visible' : 'hidden')};
  pointer-events: ${({ $removing, $visible }) =>
    $visible && !$removing ? 'auto' : 'none'};
  transform: ${({ $removing, $visible }) =>
    $visible || $removing
      ? 'translateX(0) scale(1)'
      : 'translateX(-8px) scale(0.92)'};
  transform-origin: right center;
  transition:
    max-width 280ms cubic-bezier(0.22, 1, 0.36, 1)
      ${({ $removing }) => ($removing ? '180ms' : '0ms')},
    opacity 180ms ease ${({ $removing }) => ($removing ? '180ms' : '0ms')},
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1)
      ${({ $removing }) => ($removing ? '180ms' : '0ms')};
  white-space: nowrap;
`;

export const FilterChip = styled.div<{
  $pressed?: boolean;
  $removing?: boolean;
}>`
  align-items: center;
  background: ${COLORS.blueSurface};
  border: 1px solid ${COLORS.blueBorder};
  border-radius: 4px;
  box-shadow: ${({ $pressed }) =>
    $pressed ? 'inset 0 0 0 1px rgba(25, 97, 237, 0.08)' : 'none'};
  color: ${COLORS.blue};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 12px;
  gap: 2px;
  height: 24px;
  line-height: 1.4;
  padding: 2px 2px 2px 4px;
  opacity: 1;
  transform: ${({ $pressed }) => ($pressed ? 'scale(0.985)' : 'scale(1)')};
  transition:
    box-shadow 180ms ease,
    transform 180ms ease;
  white-space: nowrap;

  animation: ${({ $removing }) =>
    $removing
      ? 'employees-filter-pop-away 320ms cubic-bezier(0.18, 1, 0.32, 1) forwards'
      : 'none'};
  transform-origin: right center;
  will-change: opacity, transform;

  @keyframes employees-filter-pop-away {
    0% {
      opacity: 1;
      transform: scale(0.985) translate3d(0, 0, 0);
    }

    36% {
      opacity: 1;
      transform: scale(1.08) translate3d(2px, -1px, 0);
    }

    100% {
      opacity: 0;
      transform: scale(0.64) translate3d(18px, -6px, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /* Snap-hide the chip when removing — animation-end still fires (the
       parent uses it as the removal signal) but the decorative pop is
       collapsed to a single frame. */
    animation-duration: 1ms;
    animation-timing-function: linear;
  }
`;

export const FilterChipLabel = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

export const FilterChipIcon = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

export const FilterName = styled.span`
  font-size: 12px;
  line-height: 1.4;
  font-weight: ${theme.font.weight.medium};
`;

export const FilterValue = styled.span`
  font-size: 12px;
  line-height: 1.4;
  font-weight: ${theme.font.weight.regular};
`;

export const FilterCloseButton = styled.button<{ $pressed?: boolean }>`
  align-items: center;
  background: ${({ $pressed }) =>
    $pressed ? 'rgba(25, 97, 237, 0.08)' : 'transparent'};
  border: 0;
  border-radius: 2px;
  color: ${COLORS.blue};
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  height: 20px;
  justify-content: center;
  padding: 0;
  transition: background-color 140ms ease;
  width: 20px;

  &:hover {
    background: ${({ $pressed }) =>
      $pressed ? 'rgba(25, 97, 237, 0.08)' : 'rgba(25, 97, 237, 0.06)'};
  }

  &:focus-visible {
    background: rgba(25, 97, 237, 0.06);
    outline: none;
  }
`;

export const AddFilter = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 4px;
  color: ${COLORS.muted};
  cursor: pointer;
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  gap: 4px;
  height: 24px;
  line-height: 1.4;
  margin-left: 1px;
  padding: 0 8px;
  transition: background-color 120ms ease;
  white-space: nowrap;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

export const FloatingAddFilter = styled(AddFilter)<{
  $animated: boolean;
  $left: number;
}>`
  left: ${({ $left }) => `${$left}px`};
  margin-left: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: ${({ $animated }) =>
    $animated ? 'left 340ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'};
`;

export const TableBodyArea = styled.div`
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

export const MarkerText = styled.span`
  color: ${COLORS.black};
  font-family: ${theme.font.family.mono};
  font-size: 20px;
  font-weight: ${theme.font.weight.medium};
  line-height: 17.011px;
  text-transform: uppercase;
`;

export const AnimatedMarkerGroup = styled.div<{
  $left: number;
  $top: number;
}>`
  left: ${({ $left }) => `${$left}px`};
  pointer-events: none;
  position: absolute;
  top: ${({ $top }) => `${$top}px`};
  transition:
    left 620ms cubic-bezier(0.22, 1, 0.36, 1),
    top 620ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 9;
`;

export const AnchoredMarkerGroup = styled.div<{
  $bottom: number;
  $right: number;
}>`
  bottom: ${({ $bottom }) => `${$bottom}px`};
  pointer-events: none;
  position: absolute;
  right: ${({ $right }) => `${$right}px`};
  transition:
    bottom 620ms cubic-bezier(0.22, 1, 0.36, 1),
    right 620ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 9;
`;

export const MarkerCursorSlot = styled.div<{
  $pressed?: boolean;
  $visible?: boolean;
}>`
  animation: ${({ $pressed, $visible }) =>
    $pressed && $visible
      ? 'cursor-pop 240ms cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none'};
  left: 0;
  opacity: ${({ $visible = true }) => ($visible ? 1 : 0)};
  position: absolute;
  top: 0;
  transform: translate(-50%, -50%) scale(1);
  transition:
    opacity 180ms ease,
    transform 140ms ease;

  @keyframes cursor-pop {
    0% {
      transform: translate(-50%, -50%) scale(1);
    }

    38% {
      transform: translate(-50%, -50%) scale(1.16);
    }

    68% {
      transform: translate(-50%, -50%) scale(0.93);
    }

    100% {
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const MarkerLabelTop = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  transform: translate(-50%, calc(-100% - 24px));
  z-index: 10;
`;

export const MarkerLabelBottom = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  transform: translate(-50%, 26px);
  z-index: 10;
`;

export const AliceLabel = styled.div`
  align-items: center;
  background: ${COLORS.yellow};
  border-radius: 4px;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  min-width: 86px;
  padding: 0 12px;
`;

export const TomMarker = styled.div`
  left: 31px;
  pointer-events: auto;
  position: absolute;
  top: 271px;
  height: 112px;
  width: 92px;
  z-index: 8;
`;

export const TomMarkerMotion = styled.div<{ $hovered: boolean }>`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transform: ${({ $hovered }) =>
    $hovered ? 'translate3d(12px, -14px, 0)' : 'translate3d(0, 0, 0)'};
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  width: 60px;
  will-change: transform;
`;

export const TomArrow = styled.div`
  align-self: flex-end;
  align-items: center;
  display: flex;
  height: 41px;
  justify-content: center;
  width: 38px;
  z-index: 2;
`;

export const TomLabel = styled.div`
  align-items: center;
  background: ${COLORS.orange};
  border-radius: 4px;
  box-sizing: border-box;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  padding: 0 10px;
  position: relative;
  width: 60px;
  z-index: 1;
`;

export const BobMarker = styled.div<{ $hidden?: boolean }>`
  left: ${BOB_MARKER_LEFT}px;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'auto')};
  position: absolute;
  top: ${BOB_MARKER_TOP}px;
  transition: opacity 180ms ease;
  height: 112px;
  width: 96px;
  z-index: 8;
`;

export const BobMarkerMotion = styled.div<{ $hovered: boolean }>`
  transform: ${({ $hovered }) =>
    $hovered ? 'translate3d(-14px, -16px, 0)' : 'translate3d(0, 0, 0)'};
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
`;

export const BobArrow = styled.div`
  height: ${MARKER_CURSOR_HEIGHT}px;
  margin-left: ${BOB_ARROW_LEFT_OFFSET}px;
  position: relative;
  width: ${MARKER_CURSOR_WIDTH}px;
  z-index: 2;
`;

export const BobLabel = styled.div<{ $withTopMargin?: boolean }>`
  align-items: center;
  background: ${COLORS.bobCursor};
  border-radius: 4px;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  margin-top: ${({ $withTopMargin }) => ($withTopMargin ? '10px' : '0')};
  min-width: 60px;
  padding: 0 12px;
  position: relative;
  z-index: 1;
`;
