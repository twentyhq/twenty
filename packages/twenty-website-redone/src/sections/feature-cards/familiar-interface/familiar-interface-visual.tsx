'use client';

import { styled } from '@linaria/react';
import { IconChevronDown, IconList, IconPlus } from '@tabler/icons-react';
import { useRef, type RefObject } from 'react';

import { useScaleToFit } from '@/platform/motion';
import { HalftoneCardBackdrop } from '@/platform/visuals/rigs/halftone-card-backdrop';
import { EASING, FONT_WEIGHT } from '@/tokens';
import { FAMILIAR_INTERFACE_SCENE } from '@/tokens/feature-scenes/familiar-interface-scene';

import {
  FAMILIAR_INTERFACE_CARDS,
  type FamiliarCardId,
} from './familiar-interface-cards-data';
import { GrabCursorIcon } from './grab-cursor-icon';
import { OpportunityPreviewCard } from './opportunity-card';
import { useOpportunityDrag, type LaneIndex } from './use-opportunity-drag';

const SCENE = FAMILIAR_INTERFACE_SCENE;
const TABLER_STROKE = 1.6;

const SCENE_WIDTH = 411;
const SCENE_HEIGHT = 508;
const FIGMA_COLUMN_GAP = 8;
const FIGMA_COLUMN_SIDE_PADDING = 5.516;
const FIGMA_FIELD_HEIGHT = 22.063;
const FIGMA_FIELD_GAP = 3.677;
const HAND_CURSOR_IDLE_POSITION = { x: 132, y: 170 };
const HAND_CURSOR_HOVER_SHIFT_X = 78;
const HAND_CURSOR_HOVER_SHIFT_Y = 10;
const HAND_CURSOR_HOVER_ROTATION_DEG = -6;

const VisualRoot = styled.div`
  background: ${SCENE.colors.imageAreaSurface};
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
  background: ${SCENE.colors.backdrop};
  border-radius: 2px;
  height: ${SCENE_HEIGHT}px;
  overflow: hidden;
  position: relative;
  width: ${SCENE_WIDTH}px;
`;

const SceneBackdrop = styled.div`
  background-color: ${SCENE.colors.backdrop};
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
`;

const BoardGroup = styled.div<{ $active: boolean }>`
  height: 563.255px;
  left: -28px;
  position: absolute;
  top: 101px;
  transform: scale(${({ $active }) => ($active ? 1.014 : 1)});
  transform-origin: center center;
  transition: transform 320ms ${EASING.standard};
  width: 412.302px;
  will-change: transform;
  z-index: 1;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const BoardSurface = styled.div`
  background: ${SCENE.colors.boardSurface};
  border: 1px solid ${SCENE.colors.border};
  border-radius: 7.354px;
  box-shadow: ${SCENE.colors.boardRing};
  display: flex;
  flex-direction: column;
  height: 563.255px;
  overflow: hidden;
  width: 386.453px;
`;

const BoardTitleRow = styled.div`
  align-items: center;
  background: ${SCENE.colors.boardSurface};
  border-bottom: 1px solid ${SCENE.colors.borderLight};
  display: flex;
  height: 36.772px;
  padding: 7.354px 12px;
`;

const ViewSwitcher = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  height: 24px;
  min-width: 0;
  padding: 0 4px;
  border-radius: 4px;
  transition: background-color 120ms ease;

  &:hover {
    background: ${SCENE.colors.softWash};
  }
`;

const ViewSwitcherIcon = styled.span`
  align-items: center;
  color: ${SCENE.colors.textSecondary};
  display: inline-flex;
  flex: 0 0 auto;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const BoardTitleMeta = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  min-width: 0;
`;

const BoardTitleText = styled.span`
  color: ${SCENE.colors.textSecondary};
  font-family: ${SCENE.appFont};
  font-size: 13px;
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const BoardTitleDot = styled.span`
  background: ${SCENE.colors.textLight};
  border-radius: 999px;
  display: inline-flex;
  flex: 0 0 auto;
  height: 2px;
  width: 2px;
`;

const BoardTitleCount = styled.span`
  color: ${SCENE.colors.textLight};
  font-family: ${SCENE.appFont};
  font-size: 13px;
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const ColumnsHeaderGrid = styled.div`
  background: ${SCENE.colors.boardSurface};
  display: grid;
  grid-template-columns: repeat(2, 186.355px);
  justify-content: center;
  min-height: 29.354px;
  position: relative;
  z-index: 1;
`;

const LaneHeader = styled.div`
  align-items: flex-start;
  border-right: 1px solid ${SCENE.colors.borderLight};
  display: flex;
  gap: 4px;
  min-height: 29.354px;
  padding: 7.354px ${FIGMA_COLUMN_SIDE_PADDING}px 0;

  &:last-child {
    border-right: none;
  }
`;

const LanePill = styled.span<{ $tone: 'pink' | 'purple' }>`
  align-items: center;
  background: ${({ $tone }) =>
    $tone === 'pink'
      ? SCENE.colors.laneLabelPinkSurface
      : SCENE.colors.laneLabelPurpleSurface};
  border-radius: 4px;
  color: ${({ $tone }) =>
    $tone === 'pink'
      ? SCENE.colors.laneLabelPink
      : SCENE.colors.laneLabelPurple};
  display: inline-flex;
  font-family: ${SCENE.appFont};
  font-size: 13px;
  font-weight: ${FONT_WEIGHT.medium};
  height: 22px;
  padding: 0 8px;
`;

const LaneCount = styled.span`
  color: ${SCENE.colors.laneCount};
  font-family: ${SCENE.appFont};
  font-size: 13px;
  line-height: 1.4;
`;

const ColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 186.355px);
  justify-content: center;
  flex: 1 1 auto;
  min-height: 0;
`;

const LaneBody = styled.div`
  border-right: 1px solid ${SCENE.colors.borderLight};
  display: flex;
  flex-direction: column;
  gap: ${FIGMA_COLUMN_GAP}px;
  min-height: 0;
  padding: 7.354px ${FIGMA_COLUMN_SIDE_PADDING}px 8px;

  &:last-child {
    border-right: none;
  }
`;

const AddCardRow = styled.div`
  align-items: center;
  color: ${SCENE.colors.textTertiary};
  display: inline-flex;
  font-family: ${SCENE.appFont};
  font-size: 13px;
  gap: ${FIGMA_FIELD_GAP}px;
  height: ${FIGMA_FIELD_HEIGHT}px;
  padding: 0 4px;
`;

const InteractionLayer = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
`;

const DragCursor = styled.div<{ $active: boolean }>`
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform: translate3d(
    ${({ $active }) =>
      HAND_CURSOR_IDLE_POSITION.x +
      ($active ? HAND_CURSOR_HOVER_SHIFT_X : 0)}px,
    0,
    0
  );
  transition: transform 420ms ${EASING.standard};
  will-change: transform;
  z-index: 4;

  @media (hover: none) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const DragCursorInner = styled.div<{ $active: boolean }>`
  transform: translate3d(
      0,
      ${({ $active }) =>
        HAND_CURSOR_IDLE_POSITION.y +
        ($active ? HAND_CURSOR_HOVER_SHIFT_Y : 0)}px,
      0
    )
    rotate(
      ${({ $active }) => ($active ? HAND_CURSOR_HOVER_ROTATION_DEG : 0)}deg
    );
  transition: transform 520ms ${SCENE.cursorSpringEase};
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const LaneDraggableCard = styled.div<{ $dragging: boolean }>`
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  touch-action: none;
  user-select: none;
`;

const DraggableCardShell = styled.div<{ $dragging: boolean }>`
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  left: 0;
  pointer-events: auto;
  position: absolute;
  top: 0;
  touch-action: none;
  user-select: none;
  will-change: transform;
  z-index: 3;
`;

export function FamiliarInterfaceVisual({
  active = false,
  backgroundImageSrc,
  pointerTargetRef,
}: {
  active?: boolean;
  backgroundImageSrc: string;
  pointerTargetRef?: RefObject<HTMLElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const interactionLayerRef = useRef<HTMLDivElement>(null);
  const sceneScale = useScaleToFit(rootRef, SCENE_WIDTH, SCENE_HEIGHT);
  const {
    activeCardId,
    dragOffset,
    draggedCardId,
    draggingCardShellRef,
    handleCapturedPointerCancel,
    handleCapturedPointerMove,
    handleCapturedPointerUp,
    handleLostPointerCapture,
    handlePointerDown,
    hasDraggedCard,
    isDragging,
    laneBodyRefs,
    laneCardRefs,
    laneCards,
  } = useOpportunityDrag({ interactionLayerRef });

  const showHandCursor =
    !hasDraggedCard && !isDragging && activeCardId === null;

  const renderLaneCard = (cardId: FamiliarCardId) => {
    const card = FAMILIAR_INTERFACE_CARDS.opportunityCards[cardId];
    const isActiveCard = activeCardId === cardId;
    const isDraggedCard = draggedCardId === cardId;

    return (
      <LaneDraggableCard
        key={cardId}
        $dragging={isDraggedCard}
        ref={(element) => {
          laneCardRefs.current[cardId] = element;
        }}
        onPointerDown={(event) => {
          handlePointerDown(event, cardId);
        }}
        style={isDraggedCard ? { visibility: 'hidden' } : undefined}
      >
        <OpportunityPreviewCard
          data={card}
          variant={isActiveCard ? 'active' : 'board'}
        />
      </LaneDraggableCard>
    );
  };

  const renderLaneBody = (laneIndex: LaneIndex) => (
    <LaneBody
      ref={(element) => {
        laneBodyRefs.current[laneIndex] = element;
      }}
    >
      {laneCards[laneIndex].map((cardId) => renderLaneCard(cardId))}
      <AddCardRow>
        <IconPlus aria-hidden size={12} stroke={TABLER_STROKE} />
        New
      </AddCardRow>
    </LaneBody>
  );

  return (
    <VisualRoot aria-hidden="true" ref={rootRef}>
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
          <BoardGroup $active={active}>
            <BoardSurface>
              <BoardTitleRow>
                <ViewSwitcher>
                  <ViewSwitcherIcon>
                    <IconList aria-hidden size={16} stroke={TABLER_STROKE} />
                  </ViewSwitcherIcon>
                  <BoardTitleMeta>
                    <BoardTitleText>All opportunities</BoardTitleText>
                    <BoardTitleDot />
                    <BoardTitleCount>9</BoardTitleCount>
                  </BoardTitleMeta>
                  <IconChevronDown
                    aria-hidden
                    color={SCENE.colors.textLight}
                    size={14}
                    stroke={TABLER_STROKE}
                  />
                </ViewSwitcher>
              </BoardTitleRow>

              <ColumnsHeaderGrid>
                <LaneHeader>
                  <LanePill $tone="pink">Identified</LanePill>
                  <LaneCount>{laneCards[0].length}</LaneCount>
                </LaneHeader>
                <LaneHeader>
                  <LanePill $tone="purple">Qualified</LanePill>
                  <LaneCount>{laneCards[1].length}</LaneCount>
                </LaneHeader>
              </ColumnsHeaderGrid>

              <ColumnsGrid>
                {renderLaneBody(0)}
                {renderLaneBody(1)}
              </ColumnsGrid>
            </BoardSurface>

            <InteractionLayer
              ref={interactionLayerRef}
              onLostPointerCapture={handleLostPointerCapture}
              onPointerCancel={handleCapturedPointerCancel}
              onPointerMove={handleCapturedPointerMove}
              onPointerUp={handleCapturedPointerUp}
            >
              {showHandCursor ? (
                <DragCursor $active={active}>
                  <DragCursorInner $active={active}>
                    <GrabCursorIcon size={72} />
                  </DragCursorInner>
                </DragCursor>
              ) : null}

              {draggedCardId !== null ? (
                <DraggableCardShell
                  $dragging={isDragging}
                  ref={draggingCardShellRef}
                  style={{
                    transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
                  }}
                >
                  <OpportunityPreviewCard
                    data={
                      FAMILIAR_INTERFACE_CARDS.opportunityCards[draggedCardId]
                    }
                    variant="active"
                  />
                </DraggableCardShell>
              ) : null}
            </InteractionLayer>
          </BoardGroup>
        </SceneFrame>
      </SceneViewport>
    </VisualRoot>
  );
}
