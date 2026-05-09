'use client';

import { createAnimationFrameLoop } from '@/lib/animation';
import { useTimeoutRegistry } from '@/lib/react';
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
import { type RefObject, useEffect, useRef, useState } from 'react';
import { LiveDataGradientBackdrop } from './LiveDataGradientBackdrop';
import { LiveDataHeroTable } from './LiveDataHeroTable';
import { MarkerCursor, TomCursor } from './LiveDataMarkers';
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
  FILTER_ROW_GAP,
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
} from './live-data-visual.styles';

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
  const timeoutRegistry = useTimeoutRegistry();
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

    const cancelSequenceSteps: Array<() => void> = [];
    setPhase('move-to-tag');

    for (const step of LIVE_DATA_SEQUENCE.slice(1)) {
      cancelSequenceSteps.push(
        timeoutRegistry.schedule(() => {
          setPhase(step.phase);
        }, step.delay),
      );
    }

    return () => {
      cancelSequenceSteps.forEach((cancelSequenceStep) => cancelSequenceStep());
    };
  }, [active, timeoutRegistry]);

  useEffect(() => {
    if (phase === 'rename-tag') {
      setTypedTagLabel(EDITED_TAG_LABEL.slice(0, 1));

      let nextIndex = 2;
      const cancelTypingSteps: Array<() => void> = [];

      const scheduleNextTypingStep = () => {
        const cancelTypingStep = timeoutRegistry.schedule(() => {
          setTypedTagLabel(EDITED_TAG_LABEL.slice(0, nextIndex));
          nextIndex += 1;

          if (nextIndex <= EDITED_TAG_LABEL.length) {
            scheduleNextTypingStep();
          }
        }, TYPING_STEP_MS);

        cancelTypingSteps.push(cancelTypingStep);
      };

      scheduleNextTypingStep();

      return () => {
        cancelTypingSteps.forEach((cancelTypingStep) => cancelTypingStep());
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
  }, [phase, timeoutRegistry]);

  useEffect(() => {
    let isMounted = true;

    const measureAddFilterLefts = () => {
      if (!isMounted) {
        return;
      }

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

    const measureTask = createAnimationFrameLoop({
      onFrame: () => {
        measureAddFilterLefts();
        return false;
      },
    });

    measureTask.start();
    window.addEventListener('resize', measureAddFilterLefts);
    void document.fonts?.ready.then(measureAddFilterLefts);

    return () => {
      isMounted = false;
      measureTask.stop();
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
