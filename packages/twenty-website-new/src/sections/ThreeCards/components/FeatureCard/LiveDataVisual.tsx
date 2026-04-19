'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconChevronDown,
  IconHeartHandshake,
  IconList,
  IconPlus,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { LiveDataGradientBackdrop } from './LiveDataGradientBackdrop';
import { LiveDataHeroTable } from './LiveDataHeroTable';

const APP_FONT = `'Inter', ${theme.font.family.sans}`;
const SCENE_HEIGHT = 508;
const SCENE_WIDTH = 411;
const SCENE_SCALE = 1;
const SCENE_SCALE_MD = 0.86;
const SCENE_SCALE_SM = 0.74;
const TABLE_PANEL_HOVER_SCALE = 1.012;
const TABLER_STROKE = 1.65;
const FILTER_ICON_STROKE = 1.33;
const FILTER_ROW_GAP = 4;
const BOB_READY_CURSOR_ROTATION = 135;
const MARKER_CURSOR_HEIGHT = 32;
const MARKER_CURSOR_WIDTH = 29;
const BOB_MARKER_LEFT = 196;
const BOB_MARKER_TOP = 372;
const BOB_ARROW_LEFT_OFFSET = 20;
const DEFAULT_ADD_FILTER_LEFTS = {
  docked: 152,
  parked: 276,
};

const COLORS = {
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

type AliceReturnPhase = 'return-to-start';
type BobLiveDataPhase =
  | 'bob-ready'
  | 'move-to-filter'
  | 'remove-filter'
  | 'return-bob';

type LiveDataPhase =
  | 'idle'
  | 'move-to-tag'
  | 'rename-tag'
  | AliceReturnPhase
  | BobLiveDataPhase
  | 'settle';

const LIVE_DATA_SEQUENCE: Array<{
  delay: number;
  phase: Exclude<LiveDataPhase, 'idle'>;
}> = [
  { delay: 0, phase: 'move-to-tag' },
  { delay: 760, phase: 'rename-tag' },
  { delay: 1700, phase: 'return-to-start' },
  { delay: 2380, phase: 'bob-ready' },
  { delay: 2620, phase: 'move-to-filter' },
  { delay: 3260, phase: 'remove-filter' },
  { delay: 3900, phase: 'return-bob' },
  { delay: 4680, phase: 'settle' },
];

const EDITED_TAG_LABEL = 'Priority';
const TYPING_STEP_MS = 90;
const ALICE_IDLE_MARKER = { left: 238, rotation: 0, top: 90 };
const BOB_READY_MARKER = {
  bottom: SCENE_HEIGHT - (BOB_MARKER_TOP + MARKER_CURSOR_HEIGHT / 2),
  right:
    SCENE_WIDTH -
    (BOB_MARKER_LEFT + BOB_ARROW_LEFT_OFFSET + MARKER_CURSOR_WIDTH / 2),
  rotation: BOB_READY_CURSOR_ROTATION,
};
const BOB_FILTER_CURSOR_ROTATION = 132;
const BOB_FILTER_MARKER = {
  bottom: 301,
  right: 50,
  rotation: BOB_FILTER_CURSOR_ROTATION,
};

const ALICE_MARKER_POSITIONS: Record<
  LiveDataPhase,
  { left: number; rotation: number; top: number }
> = {
  idle: ALICE_IDLE_MARKER,
  'move-to-tag': { left: 286, rotation: -38, top: 246 },
  'rename-tag': { left: 279, rotation: -18, top: 247 },
  'return-to-start': ALICE_IDLE_MARKER,
  'bob-ready': ALICE_IDLE_MARKER,
  'move-to-filter': ALICE_IDLE_MARKER,
  'remove-filter': ALICE_IDLE_MARKER,
  'return-bob': ALICE_IDLE_MARKER,
  settle: ALICE_IDLE_MARKER,
};

const VisualRoot = styled.div`
  background: ${COLORS.backdrop};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const SceneViewport = styled.div`
  bottom: 0;
  left: 50%;
  position: absolute;
  top: 0;
  transform: translateX(-50%) scale(${SCENE_SCALE});
  transform-origin: top center;
  width: 101%;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    transform: translateX(-50%) scale(${SCENE_SCALE_MD});
  }

  @media (max-width: 640px) {
    transform: translateX(-50%) scale(${SCENE_SCALE_SM});
  }
`;

const SceneFrame = styled.div`
  border-radius: 2px;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const SceneBackdrop = styled.div<{
  $backgroundImageRotationDeg?: number;
}>`
  background-color: ${COLORS.backdrop};
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

const SceneContent = styled.div`
  inset: 16px 0 0;
  position: absolute;
  width: 100%;
`;

const TablePanel = styled.div<{ $active?: boolean }>`
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
    `translate3d(0, 0, 0) scale(${
      $active ? TABLE_PANEL_HOVER_SCALE : 1
    })`};
  transform-origin: bottom right;
  transition:
    box-shadow 260ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, box-shadow;
  width: 355px;
`;

const ViewRow = styled.div`
  align-items: center;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  height: 40px;
  padding: 0 8px;
`;

const ViewSwitcher = styled.div`
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

const ViewSwitcherLeft = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  height: 100%;
`;

const ViewSwitcherIcon = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const ViewLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const ViewDot = styled.div`
  background: ${COLORS.textLight};
  border-radius: 999px;
  height: 2px;
  width: 2px;
`;

const ViewCount = styled.span`
  color: ${COLORS.textLight};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const ViewSwitcherChevron = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const FilterRow = styled.div`
  align-items: center;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  gap: ${FILTER_ROW_GAP}px;
  height: 48px;
  padding: 0 12px;
  position: relative;
`;

const FilterChipMotion = styled.div<{ $removing?: boolean; $visible: boolean }>`
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

const FilterChip = styled.div<{ $pressed?: boolean; $removing?: boolean }>`
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
`;

const FilterChipLabel = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

const FilterChipIcon = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const FilterName = styled.span`
  font-size: 12px;
  line-height: 1.4;
  font-weight: ${theme.font.weight.medium};
`;

const FilterValue = styled.span`
  font-size: 12px;
  line-height: 1.4;
  font-weight: ${theme.font.weight.regular};
`;

const FilterCloseButton = styled.button<{ $pressed?: boolean }>`
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

const AddFilter = styled.button`
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

const FloatingAddFilter = styled(AddFilter)<{
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

const TableBodyArea = styled.div`
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const MarkerText = styled.span`
  color: ${COLORS.black};
  font-family: ${theme.font.family.mono};
  font-size: 20px;
  font-weight: ${theme.font.weight.medium};
  line-height: 17.011px;
  text-transform: uppercase;
`;

const CursorGlyph = styled.svg<{
  $height: number;
  $rotation: number;
  $width: number;
}>`
  display: block;
  filter: drop-shadow(0 2px 4px rgba(28, 28, 28, 0.12));
  height: ${({ $height }) => `${$height}px`};
  transform: ${({ $rotation }) => `rotate(${$rotation}deg)`};
  transform-origin: center;
  transition: transform 140ms ease;
  width: ${({ $width }) => `${$width}px`};
`;

const AnimatedMarkerGroup = styled.div<{
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

const AnchoredMarkerGroup = styled.div<{
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

const MarkerCursorSlot = styled.div<{
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

const MarkerLabelTop = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  transform: translate(-50%, calc(-100% - 24px));
  z-index: 10;
`;

const MarkerLabelBottom = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  transform: translate(-50%, 26px);
  z-index: 10;
`;

const AliceLabel = styled.div`
  align-items: center;
  background: ${COLORS.yellow};
  border-radius: 4px;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  min-width: 86px;
  padding: 0 12px;
`;

const TomMarker = styled.div`
  left: 31px;
  pointer-events: auto;
  position: absolute;
  top: 271px;
  height: 112px;
  width: 92px;
  z-index: 8;
`;

const TomMarkerMotion = styled.div<{ $hovered: boolean }>`
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

const TomArrow = styled.div`
  align-self: flex-end;
  align-items: center;
  display: flex;
  height: 41px;
  justify-content: center;
  width: 38px;
  z-index: 2;
`;

const TomLabel = styled.div`
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

const TomCursorGlyph = styled.svg`
  display: block;
  filter: drop-shadow(0 2px 4px rgba(28, 28, 28, 0.12));
  height: 38px;
  transform: rotate(-90deg) scaleY(-1);
  transform-origin: center;
  width: 41px;
`;

const BobMarker = styled.div<{ $hidden?: boolean }>`
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

const BobMarkerMotion = styled.div<{ $hovered: boolean }>`
  transform: ${({ $hovered }) =>
    $hovered ? 'translate3d(-14px, -16px, 0)' : 'translate3d(0, 0, 0)'};
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
`;

const BobArrow = styled.div`
  height: ${MARKER_CURSOR_HEIGHT}px;
  margin-left: ${BOB_ARROW_LEFT_OFFSET}px;
  position: relative;
  width: ${MARKER_CURSOR_WIDTH}px;
  z-index: 2;
`;

const BobLabel = styled.div<{ $withTopMargin?: boolean }>`
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

function MarkerCursor({
  color,
  height = 32,
  rotation,
  width = 29,
}: {
  color: string;
  height?: number;
  rotation: number;
  width?: number;
}) {
  return (
    <CursorGlyph
      $height={height}
      $rotation={rotation}
      $width={width}
      fill="none"
      viewBox="0 0 36 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.0238 38.4628C19.5211 39.3742 20.8559 39.2915 21.2369 38.3257L35.6951 1.67609C36.0779 0.70584 35.1494 -0.267942 34.162 0.0682245L18.411 5.43091C18.2041 5.50136 17.9821 5.51512 17.768 5.47075L1.47559 2.09311C0.454282 1.88138 -0.346937 2.96232 0.152654 3.87791L19.0238 38.4628Z"
        fill={color}
      />
    </CursorGlyph>
  );
}

function TomCursor() {
  return (
    <TomCursorGlyph
      fill="none"
      viewBox="0 0 40.7459 37.7835"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M39.2312 0.0359766C40.2403 -0.208095 41.0759 0.836037 40.6166 1.76715L23.188 37.1009C22.7265 38.0363 21.3815 38.003 20.967 37.0458L14.3553 21.777C14.2684 21.5764 14.1294 21.4027 13.9528 21.274L0.503957 11.477C-0.339096 10.8629 -0.0768831 9.54315 0.936912 9.29795L39.2312 0.0359766Z"
        fill={COLORS.orange}
      />
    </TomCursorGlyph>
  );
}

type LiveDataVisualProps = {
  active?: boolean;
  backgroundImageRotationDeg?: number;
  backgroundImageSrc?: string;
  pointerTargetRef?: RefObject<HTMLElement | null>;
};

export function LiveDataVisual({
  active = false,
  backgroundImageSrc,
  pointerTargetRef,
}: LiveDataVisualProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const employeesFilterRef = useRef<HTMLDivElement>(null);
  const [isBobHovered, setIsBobHovered] = useState(false);
  const [isTomHovered, setIsTomHovered] = useState(false);
  const [phase, setPhase] = useState<LiveDataPhase>('idle');
  const [typedTagLabel, setTypedTagLabel] = useState('');
  const [addFilterLefts, setAddFilterLefts] = useState<{
    docked: number;
    parked: number;
  } | null>(null);

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }

    const timeoutIds: number[] = [];
    setPhase('move-to-tag');

    for (const step of LIVE_DATA_SEQUENCE.slice(1)) {
      const timeoutId = window.setTimeout(() => {
        setPhase(step.phase);
      }, step.delay);

      timeoutIds.push(timeoutId);
    }

    return () => {
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [active]);

  useEffect(() => {
    if (phase === 'rename-tag') {
      setTypedTagLabel(EDITED_TAG_LABEL.slice(0, 1));

      let nextIndex = 2;
      const intervalId = window.setInterval(() => {
        setTypedTagLabel(EDITED_TAG_LABEL.slice(0, nextIndex));

        if (nextIndex >= EDITED_TAG_LABEL.length) {
          window.clearInterval(intervalId);
          return;
        }

        nextIndex += 1;
      }, TYPING_STEP_MS);

      return () => {
        window.clearInterval(intervalId);
      };
    }

    if (
      phase === 'return-to-start' ||
      phase === 'bob-ready' ||
      phase === 'move-to-filter' ||
      phase === 'remove-filter' ||
      phase === 'return-bob' ||
      phase === 'settle'
    ) {
      setTypedTagLabel(EDITED_TAG_LABEL);
      return;
    }

    setTypedTagLabel('');
  }, [phase]);

  useEffect(() => {
    const measureAddFilterLefts = () => {
      const typeFilter = typeFilterRef.current;
      const employeesFilter = employeesFilterRef.current;

      if (
        !typeFilter ||
        !employeesFilter ||
        employeesFilter.offsetWidth === 0
      ) {
        return;
      }

      const nextLefts = {
        docked: typeFilter.offsetLeft + typeFilter.offsetWidth + FILTER_ROW_GAP,
        parked:
          employeesFilter.offsetLeft +
          employeesFilter.offsetWidth +
          FILTER_ROW_GAP,
      };

      setAddFilterLefts((current) =>
        current?.docked === nextLefts.docked &&
        current?.parked === nextLefts.parked
          ? current
          : nextLefts,
      );
    };

    const frameId = window.requestAnimationFrame(measureAddFilterLefts);
    window.addEventListener('resize', measureAddFilterLefts);
    void document.fonts?.ready.then(measureAddFilterLefts);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', measureAddFilterLefts);
    };
  }, []);

  const aliceMarker = ALICE_MARKER_POSITIONS[phase];
  const bobCursor = active
    ? phase === 'move-to-filter' || phase === 'remove-filter'
      ? BOB_FILTER_MARKER
      : BOB_READY_MARKER
    : null;
  const isAliceCursorVisible =
    phase === 'idle' ||
    phase === 'move-to-tag' ||
    phase === 'rename-tag' ||
    phase === 'return-to-start' ||
    phase === 'bob-ready' ||
    phase === 'move-to-filter' ||
    phase === 'remove-filter' ||
    phase === 'return-bob' ||
    phase === 'settle';
  const isBobCursorVisible = active;
  const isEmployeesFilterRemoving = phase === 'remove-filter';
  const isEmployeesFilterVisible =
    phase !== 'remove-filter' && phase !== 'return-bob' && phase !== 'settle';
  const hasEmployeesFilterBeenRemoved =
    phase === 'remove-filter' || phase === 'return-bob' || phase === 'settle';
  const isFirstTagRenamed =
    phase === 'rename-tag' ||
    phase === 'return-to-start' ||
    phase === 'bob-ready' ||
    phase === 'move-to-filter' ||
    phase === 'remove-filter' ||
    phase === 'return-bob' ||
    phase === 'settle';
  const isFirstTagEdited = isFirstTagRenamed;
  const isFirstTagHoveredByAlice =
    phase === 'move-to-tag' || phase === 'rename-tag';
  const isAddFilterDocked = phase === 'return-bob' || phase === 'settle';
  const addFilterLeft = isAddFilterDocked
    ? (addFilterLefts?.docked ?? DEFAULT_ADD_FILTER_LEFTS.docked)
    : (addFilterLefts?.parked ?? DEFAULT_ADD_FILTER_LEFTS.parked);
  const viewCount = hasEmployeesFilterBeenRemoved ? 11 : 9;

  return (
    <VisualRoot aria-hidden ref={rootRef}>
      <SceneViewport>
        <SceneFrame>
          <SceneBackdrop>
            <LiveDataGradientBackdrop
              active={active}
              imageUrl={backgroundImageSrc}
              pointerTargetRef={pointerTargetRef ?? rootRef}
            />
          </SceneBackdrop>
          <SceneContent>
            <AnimatedMarkerGroup
              $left={aliceMarker.left}
              $top={aliceMarker.top}
            >
              <MarkerLabelTop>
                <AliceLabel>
                  <MarkerText>Alice</MarkerText>
                </AliceLabel>
              </MarkerLabelTop>
              <MarkerCursorSlot
                $pressed={phase === 'rename-tag'}
                $visible={isAliceCursorVisible}
              >
                <MarkerCursor
                  color={COLORS.yellow}
                  rotation={aliceMarker.rotation}
                />
              </MarkerCursorSlot>
            </AnimatedMarkerGroup>
            {bobCursor ? (
              <AnchoredMarkerGroup
                $bottom={bobCursor.bottom}
                $right={bobCursor.right}
              >
                <MarkerCursorSlot
                  $pressed={phase === 'remove-filter'}
                  $visible
                >
                  <MarkerCursor
                    color={COLORS.bobCursor}
                    rotation={bobCursor.rotation}
                  />
                </MarkerCursorSlot>
                <MarkerLabelBottom>
                  <BobLabel>
                    <MarkerText>Bob</MarkerText>
                  </BobLabel>
                </MarkerLabelBottom>
              </AnchoredMarkerGroup>
            ) : null}

            <TablePanel $active={active}>
              <ViewRow>
                <ViewSwitcher>
                  <ViewSwitcherLeft>
                    <ViewSwitcherIcon>
                      <IconList
                        aria-hidden
                        color={COLORS.textSecondary}
                        size={16}
                        stroke={TABLER_STROKE}
                      />
                    </ViewSwitcherIcon>
                    <ViewLabel>All</ViewLabel>
                    <ViewDot />
                    <ViewCount>{viewCount}</ViewCount>
                  </ViewSwitcherLeft>
                  <ViewSwitcherChevron>
                    <IconChevronDown
                      aria-hidden
                      color={COLORS.textLight}
                      size={14}
                      stroke={TABLER_STROKE}
                    />
                  </ViewSwitcherChevron>
                </ViewSwitcher>
              </ViewRow>

              <FilterRow>
                <FilterChip ref={typeFilterRef}>
                  <FilterChipLabel>
                    <FilterChipIcon>
                      <IconHeartHandshake
                        aria-hidden
                        color={COLORS.blue}
                        size={14}
                        stroke={FILTER_ICON_STROKE}
                      />
                    </FilterChipIcon>
                    <FilterName>Type</FilterName>
                  </FilterChipLabel>
                  <FilterValue>is Customer</FilterValue>
                  <FilterCloseButton type="button">
                    <IconX
                      aria-hidden
                      color={COLORS.blue}
                      size={14}
                      stroke={FILTER_ICON_STROKE}
                    />
                  </FilterCloseButton>
                </FilterChip>

                <FilterChipMotion
                  ref={employeesFilterRef}
                  $removing={isEmployeesFilterRemoving}
                  $visible={isEmployeesFilterVisible}
                >
                  <FilterChip
                    $pressed={phase === 'remove-filter'}
                    $removing={isEmployeesFilterRemoving}
                  >
                    <FilterChipLabel>
                      <FilterChipIcon>
                        <IconUser
                          aria-hidden
                          color={COLORS.blue}
                          size={14}
                          stroke={FILTER_ICON_STROKE}
                        />
                      </FilterChipIcon>
                      <FilterName>Employees</FilterName>
                    </FilterChipLabel>
                    <FilterValue>{'>500'}</FilterValue>
                    <FilterCloseButton
                      $pressed={phase === 'remove-filter'}
                      type="button"
                    >
                      <IconX
                        aria-hidden
                        color={COLORS.blue}
                        size={14}
                        stroke={FILTER_ICON_STROKE}
                      />
                    </FilterCloseButton>
                  </FilterChip>
                </FilterChipMotion>

                <FloatingAddFilter
                  $animated={addFilterLefts !== null}
                  $left={addFilterLeft}
                  type="button"
                >
                  <FilterChipIcon>
                    <IconPlus
                      aria-hidden
                      color={COLORS.muted}
                      size={14}
                      stroke={FILTER_ICON_STROKE}
                    />
                  </FilterChipIcon>
                  Add filter
                </FloatingAddFilter>
              </FilterRow>

              <TableBodyArea>
                <LiveDataHeroTable
                  editedStatusLabel={isFirstTagRenamed ? typedTagLabel : ''}
                  isFirstTagEdited={isFirstTagEdited}
                  isFirstTagHoveredByAlice={isFirstTagHoveredByAlice}
                  showExtendedRows={hasEmployeesFilterBeenRemoved}
                />
              </TableBodyArea>
            </TablePanel>

            <TomMarker
              onPointerEnter={() => setIsTomHovered(true)}
              onPointerLeave={() => setIsTomHovered(false)}
            >
              <TomMarkerMotion $hovered={isTomHovered}>
                <TomArrow>
                  <TomCursor />
                </TomArrow>
                <TomLabel>
                  <MarkerText>Tom</MarkerText>
                </TomLabel>
              </TomMarkerMotion>
            </TomMarker>

            <BobMarker
              $hidden={isBobCursorVisible}
              onPointerEnter={() => setIsBobHovered(true)}
              onPointerLeave={() => setIsBobHovered(false)}
            >
              <BobMarkerMotion $hovered={isBobHovered}>
                <BobArrow>
                  <MarkerCursor color={COLORS.bobCursor} rotation={135} />
                </BobArrow>
                <BobLabel $withTopMargin>
                  <MarkerText>Bob</MarkerText>
                </BobLabel>
              </BobMarkerMotion>
            </BobMarker>
          </SceneContent>
        </SceneFrame>
      </SceneViewport>
    </VisualRoot>
  );
}
