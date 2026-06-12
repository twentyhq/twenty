'use client';

import { styled } from '@linaria/react';
import { IconChevronDown, IconList } from '@tabler/icons-react';
import { useRef, useState, type RefObject } from 'react';

import { useScaleToFit } from '@/platform/motion';
import { HalftoneCardBackdrop } from '@/platform/visuals/rigs/halftone-card-backdrop';
import { EASING, FONT_WEIGHT, fontFamily } from '@/tokens';
import { LIVE_DATA_SCENE } from '@/tokens/feature-scenes/live-data-scene';

import { LiveDataFilterRow } from './live-data-filter-row';
import { LiveDataTable } from './live-data-table';
import { MarkerCursor } from './marker-cursor';
import { TomCursor } from './tom-cursor';
import {
  useLiveDataDemoTimeline,
  type LiveDataPhase,
} from './use-live-data-demo-timeline';
import { useLiveDataFilterLayout } from './use-live-data-filter-layout';

const SCENE = LIVE_DATA_SCENE;
const SCENE_WIDTH = 411;
const SCENE_HEIGHT = 508;
const TABLE_PANEL_HOVER_SCALE = 1.012;
const TABLER_STROKE = 1.65;
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

const ALICE_IDLE_MARKER = { left: 238, rotation: 0, top: 90 };
const BOB_READY_MARKER = {
  bottom: SCENE_HEIGHT - (BOB_MARKER_TOP + MARKER_CURSOR_HEIGHT / 2),
  right:
    SCENE_WIDTH -
    (BOB_MARKER_LEFT + BOB_ARROW_LEFT_OFFSET + MARKER_CURSOR_WIDTH / 2),
  rotation: BOB_READY_CURSOR_ROTATION,
};
const BOB_FILTER_MARKER = {
  bottom: 301,
  right: 50,
  rotation: 132,
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
  background: ${SCENE.colors.backdrop};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const SceneViewport = styled.div<{ $sceneScale: number }>`
  height: ${SCENE_HEIGHT}px;
  left: 50%;
  position: absolute;
  top: 0;
  transform: translateX(-50%) scale(${({ $sceneScale }) => $sceneScale});
  transform-origin: top center;
  width: ${SCENE_WIDTH}px;
`;

const SceneFrame = styled.div`
  border-radius: 2px;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const SceneBackdrop = styled.div`
  background-color: ${SCENE.colors.backdrop};
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
  background: ${SCENE.colors.white};
  border-top-left-radius: 8px;
  box-shadow: ${({ $active }) =>
    $active ? SCENE.colors.panelActiveShadow : SCENE.colors.panelBorderRing};
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
    box-shadow 260ms ${EASING.standard},
    transform 260ms ${EASING.standard};
  will-change: transform, box-shadow;
  width: 355px;
`;

const ViewRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${SCENE.colors.rowBorder};
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
    background: ${SCENE.colors.softWash};
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
  color: ${SCENE.colors.textSecondary};
  font-family: ${SCENE.appFont};
  font-size: 13px;
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const ViewDot = styled.div`
  background: ${SCENE.colors.textLight};
  border-radius: 999px;
  height: 2px;
  width: 2px;
`;

const ViewCount = styled.span`
  color: ${SCENE.colors.textLight};
  font-family: ${SCENE.appFont};
  font-size: 13px;
  font-weight: ${FONT_WEIGHT.medium};
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

const TableBodyArea = styled.div`
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const MarkerText = styled.span`
  color: ${SCENE.colors.black};
  font-family: ${fontFamily('mono')};
  font-size: 20px;
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 17.011px;
  text-transform: uppercase;
`;

const AnimatedMarkerGroup = styled.div<{ $left: number; $top: number }>`
  left: ${({ $left }) => `${$left}px`};
  pointer-events: none;
  position: absolute;
  top: ${({ $top }) => `${$top}px`};
  transition:
    left 620ms ${EASING.standard},
    top 620ms ${EASING.standard};
  z-index: 9;
`;

const AnchoredMarkerGroup = styled.div<{ $bottom: number; $right: number }>`
  bottom: ${({ $bottom }) => `${$bottom}px`};
  pointer-events: none;
  position: absolute;
  right: ${({ $right }) => `${$right}px`};
  transition:
    bottom 620ms ${EASING.standard},
    right 620ms ${EASING.standard};
  z-index: 9;
`;

const MarkerCursorSlot = styled.div<{ $pressed?: boolean; $visible?: boolean }>`
  animation: ${({ $pressed, $visible }) =>
    $pressed && $visible ? `cursor-pop 240ms ${EASING.standard}` : 'none'};
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
  background: ${SCENE.colors.yellow};
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
  transition: transform 260ms ${EASING.standard};
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
  background: ${SCENE.colors.orange};
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
  transition: transform 260ms ${EASING.standard};
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
  background: ${SCENE.colors.bobCursor};
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

export function LiveDataVisual({
  active = false,
  backgroundImageSrc,
  pointerTargetRef,
}: {
  active?: boolean;
  backgroundImageSrc: string;
  pointerTargetRef?: RefObject<HTMLElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const employeesFilterRef = useRef<HTMLDivElement>(null);
  const sceneScale = useScaleToFit(rootRef, SCENE_WIDTH, SCENE_HEIGHT);
  const [isBobHovered, setIsBobHovered] = useState(false);
  const [isTomHovered, setIsTomHovered] = useState(false);
  const { phase, typedTagLabel } = useLiveDataDemoTimeline(active);
  const addFilterLefts = useLiveDataFilterLayout(
    typeFilterRef,
    employeesFilterRef,
  );

  const aliceMarker = ALICE_MARKER_POSITIONS[phase];
  const bobCursor = active
    ? phase === 'move-to-filter' || phase === 'remove-filter'
      ? BOB_FILTER_MARKER
      : BOB_READY_MARKER
    : null;
  const isBobCursorVisible = active;
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
  const isFirstTagHoveredByAlice =
    phase === 'move-to-tag' || phase === 'rename-tag';
  const isAddFilterDocked = phase === 'return-bob' || phase === 'settle';
  const addFilterLeft = isAddFilterDocked
    ? (addFilterLefts?.docked ?? DEFAULT_ADD_FILTER_LEFTS.docked)
    : (addFilterLefts?.parked ?? DEFAULT_ADD_FILTER_LEFTS.parked);
  const viewCount = hasEmployeesFilterBeenRemoved ? 11 : 9;

  return (
    <VisualRoot aria-hidden ref={rootRef}>
      <SceneViewport $sceneScale={sceneScale}>
        <SceneFrame>
          <SceneBackdrop>
            <HalftoneCardBackdrop
              active={active}
              config={SCENE.backdrop}
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
              <MarkerCursorSlot $pressed={phase === 'rename-tag'} $visible>
                <MarkerCursor
                  color={SCENE.colors.yellow}
                  rotation={aliceMarker.rotation}
                />
              </MarkerCursorSlot>
            </AnimatedMarkerGroup>
            {bobCursor ? (
              <AnchoredMarkerGroup
                $bottom={bobCursor.bottom}
                $right={bobCursor.right}
              >
                <MarkerCursorSlot $pressed={phase === 'remove-filter'} $visible>
                  <MarkerCursor
                    color={SCENE.colors.bobCursor}
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
                        color={SCENE.colors.textSecondary}
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
                      color={SCENE.colors.textLight}
                      size={14}
                      stroke={TABLER_STROKE}
                    />
                  </ViewSwitcherChevron>
                </ViewSwitcher>
              </ViewRow>

              <LiveDataFilterRow
                addFilterLeft={addFilterLeft}
                employeesFilterRef={employeesFilterRef}
                isAddFilterAnimated={addFilterLefts !== null}
                phase={phase}
                typeFilterRef={typeFilterRef}
              />

              <TableBodyArea>
                <LiveDataTable
                  editedStatusLabel={isFirstTagRenamed ? typedTagLabel : ''}
                  isFirstTagEdited={isFirstTagRenamed}
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
                  <MarkerCursor color={SCENE.colors.bobCursor} rotation={135} />
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
