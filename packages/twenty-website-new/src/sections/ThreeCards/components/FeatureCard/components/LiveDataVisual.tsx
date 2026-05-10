'use client';

import { WebGlMount } from '@/lib/visual-runtime';
import { useScaleToFit } from '@/sections/ThreeCards/utils/use-scale-to-fit';
import {
  IconChevronDown,
  IconHeartHandshake,
  IconList,
  IconPlus,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { type RefObject, useRef, useState } from 'react';
import { LiveDataGradientBackdrop } from './LiveDataGradientBackdrop';
import { LiveDataHeroTable } from './LiveDataHeroTable';
import { MarkerCursor } from './MarkerCursor';
import { TomCursor } from './TomCursor';
import {
  AliceLabel,
  AnchoredMarkerGroup,
  AnimatedMarkerGroup,
  BOB_ARROW_LEFT_OFFSET,
  BOB_MARKER_LEFT,
  BOB_MARKER_TOP,
  BOB_READY_CURSOR_ROTATION,
  BobArrow,
  BobLabel,
  BobMarker,
  BobMarkerMotion,
  COLORS,
  DEFAULT_ADD_FILTER_LEFTS,
  FILTER_ICON_STROKE,
  FilterChip,
  FilterChipIcon,
  FilterChipLabel,
  FilterChipMotion,
  FilterCloseButton,
  FilterName,
  FilterRow,
  FilterValue,
  FloatingAddFilter,
  MARKER_CURSOR_HEIGHT,
  MARKER_CURSOR_WIDTH,
  MarkerCursorSlot,
  MarkerLabelBottom,
  MarkerLabelTop,
  MarkerText,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  SceneBackdrop,
  SceneContent,
  SceneFrame,
  SceneViewport,
  TABLER_STROKE,
  TableBodyArea,
  TablePanel,
  TomArrow,
  TomLabel,
  TomMarker,
  TomMarkerMotion,
  ViewCount,
  ViewDot,
  ViewLabel,
  ViewRow,
  ViewSwitcher,
  ViewSwitcherChevron,
  ViewSwitcherIcon,
  ViewSwitcherLeft,
  VisualRoot,
} from '../utils/live-data-visual.styles';
import type { LiveDataPhase } from '../utils/live-data-phase';
import { useLiveDataDemoTimeline } from '../hooks/use-live-data-demo-timeline';
import { useLiveDataFilterLayout } from '../hooks/use-live-data-filter-layout';

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
      <SceneViewport $sceneScale={sceneScale}>
        <SceneFrame>
          <SceneBackdrop>
            <WebGlMount detachFromLayout>
              <LiveDataGradientBackdrop
                active={active}
                imageUrl={backgroundImageSrc}
                pointerTargetRef={pointerTargetRef ?? rootRef}
              />
            </WebGlMount>
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
                <MarkerCursorSlot $pressed={phase === 'remove-filter'} $visible>
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
