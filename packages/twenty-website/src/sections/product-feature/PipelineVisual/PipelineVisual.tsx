'use client';

import { styled } from '@linaria/react';
import {
  IconChevronDown,
  IconLayoutKanban,
  IconPlus,
} from '@tabler/icons-react';
import {
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';
import { PreviewTag } from '@/app-preview/primitives/PreviewTag';
import { clampToRange } from '@/platform/motion';

import { OpportunityCard } from './components/OpportunityCard';
import { CARDS } from './data/cards';
import { INITIAL_LANES } from './data/initial-lanes';
import { LANES_META } from './data/lanes-meta';
import { CardFlipAnimationEffect } from './effect-components/CardFlipAnimationEffect';
import { type PipelineCardAnimations } from './types/pipeline-card-animations';
import { type PipelineCardElements } from './types/pipeline-card-elements';
import { type PipelineCardId } from './types/pipeline-card-id';
import { type PipelineCardRects } from './types/pipeline-card-rects';
import { type PipelineLanes } from './types/pipeline-lanes';
import { getDropTarget } from './utils/get-drop-target';
import { movePipelineCard } from './utils/pipeline-move-card';

const TOTAL_CARD_COUNT = Object.keys(CARDS).length;

const Root = styled.div`
  background: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: var(--font-product), sans-serif;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BoardHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
`;

const BoardTitle = styled.span`
  color: ${THEME_LIGHT.font.color.secondary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
`;

const BoardAdornments = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.color.gray8};
  display: flex;
  flex-shrink: 0;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  gap: 4px;
`;

const ColumnsHeaderGrid = styled.div`
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  display: grid;
  flex-shrink: 0;
  grid-template-columns: repeat(3, 1fr);
`;

const LaneHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  padding: 8px 12px;
`;

const LaneCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const ColumnsGrid = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: repeat(3, 1fr);
  min-height: 0;
  overflow: hidden;
`;

const LaneBody = styled.div`
  border-right: 1px solid ${THEME_LIGHT.border.color.light};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 40px;
  min-width: 0;
  overflow-y: auto;
  padding: 8px;

  &:last-child {
    border-right: none;
  }
`;

const DealCard = styled.div`
  background: ${THEME_LIGHT.background.secondary};
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;

  &:hover {
    border-color: ${THEME_LIGHT.border.color.strong};
  }

  &:hover .deal-card-checkbox {
    max-width: 24px;
    opacity: 1;
    pointer-events: auto;
  }

  &[data-dragging] {
    opacity: 0;
  }
`;

const AddCardRow = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  gap: 4px;
  padding: 4px 8px;
`;

const InteractionLayer = styled.div`
  inset: 0;
  position: absolute;
  z-index: 50;
`;

const FloatingCardShell = styled.div`
  box-shadow: ${THEME_LIGHT.boxShadow.strong};
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform-origin: center center;
  width: calc(100% / 3 - 16px);
  z-index: 100;
`;

type DragState = {
  cardId: PipelineCardId;
  lastX: number;
  lastY: number;
  maxX: number;
  maxY: number;
  originX: number;
  originY: number;
  pointerX: number;
  pointerY: number;
};

export function PipelineVisual({ active: _active }: { active: boolean }) {
  const [lanes, setLanes] = useState<PipelineLanes>(INITIAL_LANES);
  const [draggedCardId, setDraggedCardId] = useState<PipelineCardId | null>(
    null,
  );

  const interactionRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const laneBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<PipelineCardElements>({});
  const pendingRectsRef = useRef<PipelineCardRects>({});
  const animationsRef = useRef<PipelineCardAnimations>({});
  const activePointerRef = useRef<number | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const captureRects = () => {
    const rects: PipelineCardRects = {};

    for (const lane of lanes) {
      for (const cardId of lane) {
        const element = cardRefs.current[cardId];

        if (element) {
          rects[cardId] = element.getBoundingClientRect();
        }
      }
    }
    pendingRectsRef.current = rects;
  };

  const moveGhost = (x: number, y: number) => {
    ghostRef.current?.style.setProperty(
      'transform',
      `translate3d(${x}px, ${y}px, 0)`,
    );
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    cardId: PipelineCardId,
  ) => {
    event.preventDefault();
    const layerRect = interactionRef.current?.getBoundingClientRect();
    const cardRect = event.currentTarget.getBoundingClientRect();

    if (!layerRect || dragStateRef.current) {
      return;
    }

    dragStateRef.current = {
      cardId,
      lastX: event.clientX,
      lastY: event.clientY,
      maxX: layerRect.width - cardRect.width,
      maxY: layerRect.height - cardRect.height,
      originX: cardRect.left - layerRect.left,
      originY: cardRect.top - layerRect.top,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    setDraggedCardId(cardId);
    activePointerRef.current = event.pointerId;
    interactionRef.current?.setPointerCapture(event.pointerId);
  };

  const finishDrag = (clientX: number, clientY: number) => {
    const state = dragStateRef.current;

    if (!state) {
      return;
    }
    const dropTarget = getDropTarget(
      clientX,
      clientY,
      state.cardId,
      laneBodyRefs.current,
      cardRefs.current,
      lanes,
    );

    if (dropTarget) {
      captureRects();
      setLanes((previous) =>
        movePipelineCard(
          previous,
          state.cardId,
          dropTarget.laneIndex,
          dropTarget.cardIndex,
        ),
      );
    }
    dragStateRef.current = null;
    setDraggedCardId(null);
    activePointerRef.current = null;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) {
      return;
    }
    event.preventDefault();
    const state = dragStateRef.current;

    if (!state) {
      return;
    }
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    moveGhost(
      clampToRange(
        state.originX + event.clientX - state.pointerX,
        0,
        state.maxX,
      ),
      clampToRange(
        state.originY + event.clientY - state.pointerY,
        0,
        state.maxY,
      ),
    );
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) {
      return;
    }
    event.preventDefault();
    finishDrag(event.clientX, event.clientY);

    if (interactionRef.current?.hasPointerCapture(event.pointerId)) {
      interactionRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) {
      return;
    }
    const state = dragStateRef.current;
    finishDrag(state?.lastX ?? event.clientX, state?.lastY ?? event.clientY);

    if (interactionRef.current?.hasPointerCapture(event.pointerId)) {
      interactionRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const handleLostCapture = () => {
    const state = dragStateRef.current;

    if (state) {
      finishDrag(state.lastX, state.lastY);
    }
    activePointerRef.current = null;
  };

  const laneHeaders = LANES_META.map((meta, laneNumber) => ({
    laneNumber,
    meta,
  }));
  const laneBodies = lanes.map((laneCardIds, laneNumber) => ({
    laneCardIds,
    laneNumber,
  }));
  const dragOrigin = dragStateRef.current;

  return (
    <Root>
      <CardFlipAnimationEffect
        animationsRef={animationsRef}
        cardRefs={cardRefs}
        lanes={lanes}
        pendingRectsRef={pendingRectsRef}
      />
      <BoardHeader>
        <IconLayoutKanban size={14} stroke={1.6} />
        <BoardTitle>By Stage</BoardTitle>
        <BoardAdornments>
          · {TOTAL_CARD_COUNT}
          <IconChevronDown size={14} stroke={1.6} />
        </BoardAdornments>
      </BoardHeader>

      <ColumnsHeaderGrid>
        {laneHeaders.map(({ laneNumber, meta }) => (
          <LaneHeader key={meta.label}>
            <PreviewTag color={meta.color} label={meta.label} />
            <LaneCount>{lanes[laneNumber].length}</LaneCount>
          </LaneHeader>
        ))}
      </ColumnsHeaderGrid>

      <ColumnsGrid>
        {laneBodies.map(({ laneCardIds, laneNumber }) => (
          <LaneBody
            key={laneNumber}
            ref={(element) => {
              laneBodyRefs.current[laneNumber] = element;
            }}
          >
            {laneCardIds.map((cardId) => (
              <DealCard
                data-dragging={draggedCardId === cardId ? '' : undefined}
                key={cardId}
                onPointerDown={(event) => handlePointerDown(event, cardId)}
                ref={(element) => {
                  cardRefs.current[cardId] = element;
                }}
              >
                <OpportunityCard data={CARDS[cardId]} />
              </DealCard>
            ))}
            <AddCardRow>
              <IconPlus size={16} stroke={1.6} />
              New
            </AddCardRow>
          </LaneBody>
        ))}
      </ColumnsGrid>

      <InteractionLayer
        onLostPointerCapture={handleLostCapture}
        onPointerCancel={handlePointerCancel}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={interactionRef}
        style={{ pointerEvents: draggedCardId ? 'auto' : 'none' }}
      >
        {draggedCardId && dragOrigin ? (
          <FloatingCardShell
            ref={ghostRef}
            style={{
              transform: `translate3d(${dragOrigin.originX}px, ${dragOrigin.originY}px, 0)`,
            }}
          >
            <DealCard>
              <OpportunityCard data={CARDS[draggedCardId]} />
            </DealCard>
          </FloatingCardShell>
        ) : null}
      </InteractionLayer>
    </Root>
  );
}
