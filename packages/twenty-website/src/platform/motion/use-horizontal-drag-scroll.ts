'use client';

import {
  useEffect,
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

// Vertical wheel intent maps to horizontal panning when the viewport
// only scrolls sideways (the live-data table); ported.
const getHorizontalWheelScrollLeft = (
  state: { clientWidth: number; scrollLeft: number; scrollWidth: number },
  delta: { deltaX: number; deltaY: number },
): number | null => {
  if (Math.abs(delta.deltaY) <= Math.abs(delta.deltaX)) {
    return null;
  }

  const maxScrollLeft = Math.max(state.scrollWidth - state.clientWidth, 0);
  const nextScrollLeft = Math.min(
    Math.max(state.scrollLeft + delta.deltaY, 0),
    maxScrollLeft,
  );

  return Math.abs(nextScrollLeft - state.scrollLeft) < 0.5
    ? null
    : nextScrollLeft;
};

// Mouse-drag panning for the table viewport (ported; touch scrolls
// natively, so only primary-button mouse drags engage).
export function useHorizontalDragScroll<TElement extends HTMLElement>({
  wheelScrollsHorizontally = false,
}: {
  wheelScrollsHorizontally?: boolean;
} = {}) {
  const viewportRef = useRef<TElement>(null);
  const dragRef = useRef<DragState>(EMPTY_DRAG_STATE);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!wheelScrollsHorizontally || !viewport) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const nextScrollLeft = getHorizontalWheelScrollLeft(
        {
          clientWidth: viewport.clientWidth,
          scrollLeft: viewport.scrollLeft,
          scrollWidth: viewport.scrollWidth,
        },
        {
          deltaX: event.deltaX,
          deltaY: event.deltaY,
        },
      );

      if (nextScrollLeft === null) {
        return;
      }

      viewport.scrollLeft = nextScrollLeft;
      event.preventDefault();
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, [wheelScrollsHorizontally]);

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
