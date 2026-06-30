'use client';

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { getElementScale } from './get-element-scale';

type Point = { x: number; y: number };

export type PointerDragPositions = {
  // Spread onto the canvas that hosts the draggable items.
  canvasHandlers: {
    onLostPointerCapture: () => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  };
  draggingId: string | null;
  handlePointerDown: (
    id: string,
    event: ReactPointerEvent<HTMLElement>,
  ) => void;
  positions: Record<string, Point>;
};

// Free-position dragging for a record of items (the stepper's entity and
// workflow graphs): capture on the pressed item, reposition under the
// pointer, and survive every interruption — pointer cancel, a stolen
// capture (lostpointercapture bubbles from the item) and unmount during
// a drag all settle the state and release the capture.
export function usePointerDragPositions(
  initialPositions: () => Record<string, Point>,
): PointerDragPositions {
  const [positions, setPositions] =
    useState<Record<string, Point>>(initialPositions);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const captureRef = useRef<{
    element: HTMLElement;
    pointerId: number;
  } | null>(null);
  const dragStartRef = useRef<{
    id: string;
    positionX: number;
    positionY: number;
    scale: number;
    startX: number;
    startY: number;
  } | null>(null);

  const endDrag = () => {
    const capture = captureRef.current;

    if (capture?.element.hasPointerCapture(capture.pointerId)) {
      capture.element.releasePointerCapture(capture.pointerId);
    }
    captureRef.current = null;
    dragStartRef.current = null;
    setDraggingId(null);
  };

  const handlePointerDown = (
    id: string,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (dragStartRef.current) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    captureRef.current = {
      element: event.currentTarget,
      pointerId: event.pointerId,
    };
    const position = positions[id];
    dragStartRef.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      positionX: position.x,
      positionY: position.y,
      scale: getElementScale(event.currentTarget),
    };
    setDraggingId(id);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const dragStart = dragStartRef.current;

    if (!dragStart || event.pointerId !== captureRef.current?.pointerId) {
      return;
    }
    const { id, startX, startY, positionX, positionY, scale } = dragStart;
    const deltaX = (event.clientX - startX) / scale;
    const deltaY = (event.clientY - startY) / scale;
    setPositions((previous) => ({
      ...previous,
      [id]: { x: positionX + deltaX, y: positionY + deltaY },
    }));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerId !== captureRef.current?.pointerId) {
      return;
    }
    endDrag();
  };

  const handleLostCapture = () => {
    if (dragStartRef.current) {
      endDrag();
    }
  };

  useEffect(() => {
    return () => {
      const capture = captureRef.current;

      if (capture?.element.hasPointerCapture(capture.pointerId)) {
        capture.element.releasePointerCapture(capture.pointerId);
      }
    };
  }, []);

  return {
    canvasHandlers: {
      onLostPointerCapture: handleLostCapture,
      onPointerCancel: handlePointerUp,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
    draggingId,
    handlePointerDown,
    positions,
  };
}
