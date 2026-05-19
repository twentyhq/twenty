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

type UseHorizontalDragScrollOptions = {
  wheelScrollsHorizontally?: boolean;
};

export type HorizontalWheelScrollState = {
  clientWidth: number;
  scrollLeft: number;
  scrollWidth: number;
};

export type HorizontalWheelDelta = {
  deltaX: number;
  deltaY: number;
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

export const getHorizontalWheelScrollLeft = (
  state: HorizontalWheelScrollState,
  delta: HorizontalWheelDelta,
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

export function useHorizontalDragScroll<TElement extends HTMLElement>({
  wheelScrollsHorizontally = false,
}: UseHorizontalDragScrollOptions = {}) {
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

  const handlePointerDown = (event: ReactPointerEvent<TElement>) => {
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

  const handlePointerMove = (event: ReactPointerEvent<TElement>) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;

    if (!drag.active || !viewport) {
      return;
    }

    viewport.scrollLeft = drag.startScrollLeft - (event.clientX - drag.startX);
  };

  const handlePointerUp = (event: ReactPointerEvent<TElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    endDragging();
  };

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

  return {
    dragging,
    onPointerCancel: endDragging,
    onPointerDown: handlePointerDown,
    onPointerLeave: endDragging,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    viewportRef,
  };
}
