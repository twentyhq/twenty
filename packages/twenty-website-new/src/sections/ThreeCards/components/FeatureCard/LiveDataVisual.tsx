'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconCheckbox,
  IconChevronDown,
  IconList,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { LiveDataHeroTable } from './LiveDataHeroTable';

const APP_FONT = `'Inter', ${theme.font.family.sans}`;
const SCENE_HEIGHT = 508;
const SCENE_WIDTH = 411;
const SCENE_SCALE = 1;
const SCENE_SCALE_MD = 0.86;
const SCENE_SCALE_SM = 0.74;
const TABLER_STROKE = 1.65;
const FILTER_ICON_STROKE = 1.33;

const COLORS = {
  backdrop: '#1b1b1b',
  backdropDot: 'rgba(255, 255, 255, 0.14)',
  backdropStripe: 'rgba(255, 255, 255, 0.20)',
  black: '#1f1f1f',
  blue: '#1961ed',
  blueBorder: '#edf2fe',
  blueSurface: '#f5f9fd',
  cardSurface: '#f5f5f3',
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

type LiveDataPhase =
  | 'idle'
  | 'move-to-tag'
  | 'rename-tag'
  | 'settle';

const LIVE_DATA_SEQUENCE: Array<{
  delay: number;
  phase: Exclude<LiveDataPhase, 'idle'>;
}> = [
  { delay: 0, phase: 'move-to-tag' },
  { delay: 760, phase: 'rename-tag' },
  { delay: 1860, phase: 'settle' },
];

const LIVE_DATA_LOOP_DURATION = 3200;
const EDITED_TAG_LABEL = 'Priority';
const TYPING_STEP_MS = 90;

const LIVE_DATA_CURSOR_POSITIONS: Record<
  LiveDataPhase,
  { left: number; rotation: number; top: number }
> = {
  idle: { left: 238, rotation: 0, top: 90 },
  'move-to-tag': { left: 286, rotation: -38, top: 272 },
  'rename-tag': { left: 279, rotation: -18, top: 273 },
  settle: { left: 293, rotation: -18, top: 277 },
};

const VisualRoot = styled.div`
  background: ${COLORS.cardSurface};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const SceneViewport = styled.div`
  height: ${SCENE_HEIGHT}px;
  left: 50%;
  position: absolute;
  top: 16px;
  transform: translateX(-50%) scale(${SCENE_SCALE});
  transform-origin: top center;
  width: ${SCENE_WIDTH}px;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    transform: translateX(-50%) scale(${SCENE_SCALE_MD});
  }

  @media (max-width: 640px) {
    transform: translateX(-50%) scale(${SCENE_SCALE_SM});
  }
`;

const SceneFrame = styled.div`
  background: ${COLORS.backdrop};
  border-radius: 2px;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;

  &::before {
    background: radial-gradient(
        circle at 1px 1px,
        ${COLORS.backdropDot} 1px,
        transparent 1.2px
      ),
      repeating-linear-gradient(
        90deg,
        transparent 0 18px,
        ${COLORS.backdropStripe} 18px 25px,
        transparent 25px 52px
      );
    background-size:
      12px 12px,
      100% 32px;
    content: '';
    inset: 0;
    opacity: 0.8;
    position: absolute;
  }
`;

const AccentRail = styled.div`
  background: repeating-linear-gradient(
    180deg,
    ${COLORS.backdropStripe} 0 4px,
    transparent 4px 11px
  );
  bottom: 0;
  left: 0;
  opacity: 0.9;
  position: absolute;
  top: 67%;
  width: 58px;
`;

const TablePanel = styled.div`
  background: ${COLORS.white};
  border-top-left-radius: ${theme.radius(1)};
  box-shadow: 0 0 0 1px rgba(241, 241, 241, 0.9);
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  height: 341px;
  left: 58px;
  overflow: hidden;
  position: absolute;
  top: 151px;
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
  gap: 4px;
  height: 48px;
  padding: 0 12px;
`;

const FilterChip = styled.div<{ $pressed?: boolean }>`
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
  transform: ${({ $pressed }) => ($pressed ? 'scale(0.985)' : 'scale(1)')};
  transition:
    box-shadow 180ms ease,
    transform 180ms ease;
  white-space: nowrap;
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

const FilterCloseButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 2px;
  color: ${COLORS.blue};
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  height: 20px;
  justify-content: center;
  padding: 0;
  width: 20px;
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

const AnimatedCursorLayer = styled.div<{
  $left: number;
  $pressed?: boolean;
  $top: number;
}>`
  animation: ${({ $pressed }) =>
    $pressed ? 'cursor-pop 240ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'};
  left: ${({ $left }) => `${$left}px`};
  opacity: 1;
  pointer-events: none;
  position: absolute;
  top: ${({ $top }) => `${$top}px`};
  transform: translate(-50%, -50%) scale(1);
  transition:
    left 620ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease,
    top 620ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 140ms ease;
  z-index: 9;

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
`;

const AnimatedNameTagLayer = styled.div<{
  $left: number;
  $top: number;
}>`
  left: ${({ $left }) => `${$left}px`};
  pointer-events: none;
  position: absolute;
  top: ${({ $top }) => `${$top}px`};
  transform: translate(-50%, calc(-100% - 18px));
  transition:
    left 620ms cubic-bezier(0.22, 1, 0.36, 1),
    top 620ms cubic-bezier(0.22, 1, 0.36, 1);
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
  top: 306px;
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

const BobMarker = styled.div`
  pointer-events: auto;
  left: 214px;
  position: absolute;
  top: 386px;
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
  margin-left: 20px;
  position: relative;
  z-index: 2;
`;

const BobLabel = styled.div`
  align-items: center;
  background: ${COLORS.purple};
  border-radius: 4px;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  margin-top: 10px;
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
};

export function LiveDataVisual({ active = false }: LiveDataVisualProps) {
  const [isBobHovered, setIsBobHovered] = useState(false);
  const [isTomHovered, setIsTomHovered] = useState(false);
  const [phase, setPhase] = useState<LiveDataPhase>('idle');
  const [typedTagLabel, setTypedTagLabel] = useState('');

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }

    let cancelled = false;
    const timeoutIds: number[] = [];

    const runSequence = () => {
      setPhase('move-to-tag');

      for (const step of LIVE_DATA_SEQUENCE.slice(1)) {
        const timeoutId = window.setTimeout(() => {
          if (!cancelled) {
            setPhase(step.phase);
          }
        }, step.delay);

        timeoutIds.push(timeoutId);
      }

      const loopTimeoutId = window.setTimeout(() => {
        if (!cancelled) {
          runSequence();
        }
      }, LIVE_DATA_LOOP_DURATION);

      timeoutIds.push(loopTimeoutId);
    };

    runSequence();

    return () => {
      cancelled = true;

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

    if (phase === 'settle') {
      setTypedTagLabel(EDITED_TAG_LABEL);
      return;
    }

    setTypedTagLabel('');
  }, [phase]);

  const animatedCursor = LIVE_DATA_CURSOR_POSITIONS[phase];
  const isFirstTagRenamed = phase === 'rename-tag' || phase === 'settle';
  const isFirstTagEdited = phase === 'rename-tag' || phase === 'settle';
  const isFirstTagHoveredByAlice = phase !== 'idle';

  return (
    <VisualRoot aria-hidden>
      <SceneViewport>
        <SceneFrame>
          <AccentRail />

          <AnimatedNameTagLayer
            $left={animatedCursor.left}
            $top={animatedCursor.top}
          >
            <AliceLabel>
              <MarkerText>Alice</MarkerText>
            </AliceLabel>
          </AnimatedNameTagLayer>

          <AnimatedCursorLayer
            $left={animatedCursor.left}
            $pressed={phase === 'rename-tag'}
            $top={animatedCursor.top}
          >
            <MarkerCursor
              color={COLORS.yellow}
              rotation={animatedCursor.rotation}
            />
          </AnimatedCursorLayer>

          <TablePanel>
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
                  <ViewCount>9</ViewCount>
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
              <FilterChip>
                <FilterChipLabel>
                  <FilterChipIcon>
                    <IconCheckbox
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

              <FilterChip>
                <FilterChipLabel>
                  <FilterChipIcon>
                    <IconCheckbox
                      aria-hidden
                      color={COLORS.blue}
                      size={14}
                      stroke={FILTER_ICON_STROKE}
                    />
                  </FilterChipIcon>
                  <FilterName>Employees</FilterName>
                </FilterChipLabel>
                <FilterValue>{'>500'}</FilterValue>
                <FilterCloseButton type="button">
                  <IconX
                    aria-hidden
                    color={COLORS.blue}
                    size={14}
                    stroke={FILTER_ICON_STROKE}
                  />
                </FilterCloseButton>
              </FilterChip>

              <AddFilter type="button">
                <FilterChipIcon>
                  <IconPlus
                    aria-hidden
                    color={COLORS.muted}
                    size={14}
                    stroke={FILTER_ICON_STROKE}
                  />
                </FilterChipIcon>
                Add filter
              </AddFilter>
            </FilterRow>

            <TableBodyArea>
              <LiveDataHeroTable
                editedStatusLabel={isFirstTagRenamed ? typedTagLabel : ''}
                isFirstTagEdited={isFirstTagEdited}
                isFirstTagHoveredByAlice={isFirstTagHoveredByAlice}
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
            onPointerEnter={() => setIsBobHovered(true)}
            onPointerLeave={() => setIsBobHovered(false)}
          >
            <BobMarkerMotion $hovered={isBobHovered}>
              <BobArrow>
                <MarkerCursor color={COLORS.purple} rotation={135} />
              </BobArrow>
              <BobLabel>
                <MarkerText>Bob</MarkerText>
              </BobLabel>
            </BobMarkerMotion>
          </BobMarker>
        </SceneFrame>
      </SceneViewport>
    </VisualRoot>
  );
}
