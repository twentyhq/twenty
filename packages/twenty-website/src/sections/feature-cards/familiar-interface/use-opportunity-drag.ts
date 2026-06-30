'use client';

import { clampToRange } from '@/platform/motion';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import { EASING } from '@/tokens';

import {
  FAMILIAR_INTERFACE_CARDS,
  type FamiliarCardId,
  type FamiliarLaneCards,
} from './familiar-interface-cards-data';

// The scene's pointer-captured card drag with FLIP drop animations,
// ported verbatim from the old FamiliarInterfaceVisual.
const CARD_DROP_ANIMATION_MS = 320;

export type LaneIndex = 0 | 1;
type DropTarget = { cardIndex: number; laneIndex: LaneIndex };

function moveCardToLanePosition(
  lanes: FamiliarLaneCards,
  cardId: FamiliarCardId,
  targetLaneIndex: LaneIndex,
  targetCardIndex: number,
): FamiliarLaneCards {
  const [firstLane, secondLane] = lanes;
  const nextLanes: FamiliarLaneCards = [
    firstLane.filter((laneCardId) => laneCardId !== cardId),
    secondLane.filter((laneCardId) => laneCardId !== cardId),
  ];

  const boundedTargetCardIndex = clampToRange(
    targetCardIndex,
    0,
    nextLanes[targetLaneIndex].length,
  );

  nextLanes[targetLaneIndex] = [
    ...nextLanes[targetLaneIndex].slice(0, boundedTargetCardIndex),
    cardId,
    ...nextLanes[targetLaneIndex].slice(boundedTargetCardIndex),
  ];

  return nextLanes;
}

export function useOpportunityDrag({
  interactionLayerRef,
}: {
  interactionLayerRef: RefObject<HTMLDivElement | null>;
}) {
  const laneBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const laneCardRefs = useRef<
    Partial<Record<FamiliarCardId, HTMLDivElement | null>>
  >({});
  const draggingCardShellRef = useRef<HTMLDivElement>(null);
  const pendingCardAnimationRectsRef = useRef<
    Partial<Record<FamiliarCardId, DOMRect>>
  >({});
  const cardAnimationRefs = useRef<Partial<Record<FamiliarCardId, Animation>>>(
    {},
  );
  const [laneCards, setLaneCards] = useState<FamiliarLaneCards>(
    FAMILIAR_INTERFACE_CARDS.initialLaneCards,
  );
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeCardId, setActiveCardId] = useState<FamiliarCardId | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<FamiliarCardId | null>(
    null,
  );
  const [hasDraggedCard, setHasDraggedCard] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    cardId: FamiliarCardId;
    lastClientX: number;
    lastClientY: number;
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
    originX: number;
    originY: number;
    pointerX: number;
    pointerY: number;
  } | null>(null);

  // FLIP: rects captured before the drop commit animate the settled lane
  // cards from their previous positions.
  useLayoutEffect(() => {
    const previousCardRects = pendingCardAnimationRectsRef.current;
    const animatedCardIds = Object.keys(previousCardRects) as FamiliarCardId[];

    if (animatedCardIds.length === 0) {
      return;
    }

    pendingCardAnimationRectsRef.current = {};

    for (const cardId of animatedCardIds) {
      const previousRect = previousCardRects[cardId];
      const laneCardElement = laneCardRefs.current[cardId];
      const nextRect = laneCardElement?.getBoundingClientRect();

      if (!previousRect || !laneCardElement || !nextRect) {
        continue;
      }

      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        continue;
      }

      cardAnimationRefs.current[cardId]?.cancel();

      cardAnimationRefs.current[cardId] = laneCardElement.animate(
        [
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
          { transform: 'translate3d(0, 0, 0)' },
        ],
        {
          duration: CARD_DROP_ANIMATION_MS,
          easing: EASING.standard,
        },
      );
    }
  }, [laneCards]);

  const captureCardAnimationRects = (draggingCardId?: FamiliarCardId) => {
    const nextCardRects: Partial<Record<FamiliarCardId, DOMRect>> = {};

    for (const lane of laneCards) {
      for (const laneCardId of lane) {
        if (laneCardId === draggingCardId && draggingCardShellRef.current) {
          nextCardRects[laneCardId] =
            draggingCardShellRef.current.getBoundingClientRect();
          continue;
        }

        const laneCardElement = laneCardRefs.current[laneCardId];

        if (laneCardElement) {
          nextCardRects[laneCardId] = laneCardElement.getBoundingClientRect();
        }
      }
    }

    if (
      draggingCardId &&
      nextCardRects[draggingCardId] === undefined &&
      draggingCardShellRef.current
    ) {
      nextCardRects[draggingCardId] =
        draggingCardShellRef.current.getBoundingClientRect();
    }

    pendingCardAnimationRectsRef.current = nextCardRects;
  };

  const releaseActivePointerCapture = () => {
    const activePointerId = activePointerIdRef.current;
    const interactionLayer = interactionLayerRef.current;

    if (
      activePointerId !== null &&
      interactionLayer?.hasPointerCapture(activePointerId)
    ) {
      interactionLayer.releasePointerCapture(activePointerId);
    }

    activePointerIdRef.current = null;
  };

  const clearDragState = () => {
    dragStateRef.current = null;
    setActiveCardId(null);
    setDraggedCardId(null);
    setIsDragging(false);
  };

  const updateDragOffsetFromPointer = (clientX: number, clientY: number) => {
    const currentDragState = dragStateRef.current;

    if (currentDragState === null) {
      return;
    }

    currentDragState.lastClientX = clientX;
    currentDragState.lastClientY = clientY;

    const nextX = clampToRange(
      currentDragState.originX + clientX - currentDragState.pointerX,
      currentDragState.minX,
      currentDragState.maxX,
    );
    const nextY = clampToRange(
      currentDragState.originY + clientY - currentDragState.pointerY,
      currentDragState.minY,
      currentDragState.maxY,
    );

    setDragOffset({ x: nextX, y: nextY });
  };

  const getDropTarget = (
    clientX: number,
    clientY: number,
    cardId: FamiliarCardId,
  ): DropTarget | null => {
    const matchedLaneIndex = laneBodyRefs.current.findIndex((laneBody) => {
      const rect = laneBody?.getBoundingClientRect();

      return (
        rect !== undefined &&
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    });

    if (matchedLaneIndex === 0 || matchedLaneIndex === 1) {
      const laneIndex = matchedLaneIndex;
      const targetLaneCards = laneCards[laneIndex].filter(
        (laneCardId) => laneCardId !== cardId,
      );

      let cardIndex = targetLaneCards.length;

      for (const [index, targetCardId] of targetLaneCards.entries()) {
        const targetCardRect =
          laneCardRefs.current[targetCardId]?.getBoundingClientRect();

        if (!targetCardRect) {
          continue;
        }

        if (clientY < targetCardRect.top + targetCardRect.height / 2) {
          cardIndex = index;
          break;
        }
      }

      return { cardIndex, laneIndex };
    }

    return null;
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    cardId: FamiliarCardId,
  ) => {
    event.preventDefault();

    const interactionLayerRect =
      interactionLayerRef.current?.getBoundingClientRect();
    const cardRect = event.currentTarget.getBoundingClientRect();

    if (!interactionLayerRect) {
      return;
    }

    if (dragStateRef.current !== null) {
      return;
    }

    setHasDraggedCard(true);
    setActiveCardId(cardId);
    setDraggedCardId(cardId);

    const originX = cardRect.left - interactionLayerRect.left;
    const originY = cardRect.top - interactionLayerRect.top;

    dragStateRef.current = {
      cardId,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      maxX: interactionLayerRect.width - cardRect.width,
      maxY: interactionLayerRect.height - cardRect.height,
      minX: 0,
      minY: 0,
      originX,
      originY,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    setDragOffset({ x: originX, y: originY });
    setIsDragging(true);
    activePointerIdRef.current = event.pointerId;
    interactionLayerRef.current?.setPointerCapture(event.pointerId);
  };

  const finishDragAtPosition = (clientX: number, clientY: number) => {
    const currentDragState = dragStateRef.current;

    if (currentDragState === null) {
      return;
    }

    const dropTarget = getDropTarget(clientX, clientY, currentDragState.cardId);

    if (dropTarget !== null) {
      captureCardAnimationRects(currentDragState.cardId);

      setLaneCards((currentLaneCards) =>
        moveCardToLanePosition(
          currentLaneCards,
          currentDragState.cardId,
          dropTarget.laneIndex,
          dropTarget.cardIndex,
        ),
      );
    }

    clearDragState();
  };

  const handleCapturedPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    event.preventDefault();
    updateDragOffsetFromPointer(event.clientX, event.clientY);
  };

  const handleCapturedPointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    event.preventDefault();
    finishDragAtPosition(event.clientX, event.clientY);
    releaseActivePointerCapture();
  };

  const handleCapturedPointerCancel = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    event.preventDefault();

    const currentDragState = dragStateRef.current;

    if (currentDragState !== null) {
      finishDragAtPosition(
        currentDragState.lastClientX,
        currentDragState.lastClientY,
      );
    }

    releaseActivePointerCapture();
  };

  const handleLostPointerCapture = () => {
    const currentDragState = dragStateRef.current;

    if (currentDragState !== null) {
      finishDragAtPosition(
        currentDragState.lastClientX,
        currentDragState.lastClientY,
      );
    }

    activePointerIdRef.current = null;
  };

  useEffect(() => {
    return () => {
      releaseActivePointerCapture();
    };
    // unmount-only pointer-capture release
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
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
  };
}
