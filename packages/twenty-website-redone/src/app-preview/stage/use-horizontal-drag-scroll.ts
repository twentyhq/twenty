'use client';

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

type DragState = {
  active: boolean;
  pointerId: number;
  startScrollLeft: number;
  startX: number;
};

const EMPTY_DRAG_STATE: DragState = {
  active: false,
  pointerId: -1,
  startScrollLeft: 0,
  startX: 0,
};

const releasePointerCapture = (element: HTMLElement, pointerId: number) => {
  if (pointerId < 0 || !element.hasPointerCapture(pointerId)) {
    return;
  }
  element.releasePointerCapture(pointerId);
};

// Mouse-drag panning for the table viewport (ported; touch scrolls
// natively, so only primary-button mouse drags engage).
export function useHorizontalDragScroll<TElement extends HTMLElement>() {
  const viewportRef = useRef<TElement>(null);
  const dragRef = useRef<DragState>(EMPTY_DRAG_STATE);
  const [dragging, setDragging] = useState(false);

  const endDragging = () => {
    const viewport = viewportRef.current;
    const pointerId = dragRef.current.pointerId;
    if (viewport) {
      releasePointerCapture(viewport, pointerId);
    }
    dragRef.current = EMPTY_DRAG_STATE;
    setDragging(false);
  };

  const onPointerDown = (event: ReactPointerEvent<TElement>) => {
    const viewport = viewportRef.current;
    if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport) {
      return;
    }
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startScrollLeft: viewport.scrollLeft,
      startX: event.clientX,
    };
    viewport.setPointerCapture(event.pointerId);
    setDragging(true);
    event.preventDefault();
  };

  const onPointerMove = (event: ReactPointerEvent<TElement>) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;
    if (!drag.active || !viewport) {
      return;
    }
    viewport.scrollLeft = drag.startScrollLeft - (event.clientX - drag.startX);
  };

  const onPointerUp = (event: ReactPointerEvent<TElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }
    endDragging();
  };

  const onPointerCancel = onPointerUp;
  const onPointerLeave = (event: ReactPointerEvent<TElement>) => {
    if (!dragRef.current.active) {
      return;
    }
    onPointerUp(event);
  };

  return {
    dragging,
    onPointerCancel,
    onPointerDown,
    onPointerLeave,
    onPointerMove,
    onPointerUp,
    viewportRef,
  };
}
