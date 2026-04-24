'use client';

import { styled } from '@linaria/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { theme } from '@/theme';
import { VISUAL_TOKENS } from '../homeVisualTokens';
import { useWindowOrder } from '../WindowOrder/WindowOrderProvider';
import { WINDOW_SHADOWS } from '../windowShadows';
import { MacWindowBar } from './MacWindowBar';

const WINDOW_ID = 'twenty-app-window';
const MIN_WIDTH = 640;
const MIN_HEIGHT = 420;
const MIN_EDGE_GAP = 0;
const INITIAL_MAX_WIDTH = 1040;
const INITIAL_ASPECT_RATIO = 1280 / 832;
const MOBILE_PARENT_BREAKPOINT = 640;

type Position = { left: number; top: number };
type Size = { width: number; height: number };

type DragState = {
  pointerId: number;
  originX: number;
  originY: number;
  startLeft: number;
  startTop: number;
};

type ResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type ResizeEdge = 'top' | 'right' | 'bottom' | 'left';

type ResizeHandle = ResizeCorner | ResizeEdge;

type ResizeState = {
  pointerId: number;
  originX: number;
  originY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
  handle: ResizeHandle;
};

const HORIZONTAL_HANDLES: ReadonlySet<ResizeHandle> = new Set([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'left',
  'right',
]);
const VERTICAL_HANDLES: ReadonlySet<ResizeHandle> = new Set([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'top',
  'bottom',
]);
const LEFT_HANDLES: ReadonlySet<ResizeHandle> = new Set([
  'top-left',
  'bottom-left',
  'left',
]);
const TOP_HANDLES: ReadonlySet<ResizeHandle> = new Set([
  'top-left',
  'top-right',
  'top',
]);

const Shell = styled.div<{
  $isResizing: boolean;
  $isReady: boolean;
  $isActive: boolean;
}>`
  background-color: ${VISUAL_TOKENS.background.primary};
  background-image: ${VISUAL_TOKENS.background.noisy};
  border: 1px solid ${VISUAL_TOKENS.border.color.medium};
  border-radius: 20px;
  box-shadow: ${({ $isActive }) =>
    $isActive ? WINDOW_SHADOWS.mobileElevated : WINDOW_SHADOWS.mobileResting};
  display: flex;
  flex-direction: column;
  left: 0;
  opacity: ${({ $isReady }) => ($isReady ? 1 : 0)};
  overflow: hidden;
  position: absolute;
  top: 0;
  touch-action: none;
  transition:
    box-shadow 0.22s ease,
    opacity 0.1s ease;
  will-change: transform, width, height;

  @media (min-width: ${theme.breakpoints.md}px) {
    box-shadow: ${({ $isActive }) =>
      $isActive ? WINDOW_SHADOWS.elevated : WINDOW_SHADOWS.resting};
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
`;

const ResizeEdgeBase = styled.div`
  position: absolute;
  z-index: 4;
`;
const ResizeEdgeTop = styled(ResizeEdgeBase)`
  cursor: ns-resize;
  height: 6px;
  left: 40px;
  right: 40px;
  top: -3px;
`;
const ResizeEdgeBottom = styled(ResizeEdgeBase)`
  bottom: -3px;
  cursor: ns-resize;
  height: 6px;
  left: 40px;
  right: 40px;
`;
const ResizeEdgeLeft = styled(ResizeEdgeBase)`
  bottom: 16px;
  cursor: ew-resize;
  left: -3px;
  top: 16px;
  width: 6px;
`;
const ResizeEdgeRight = styled(ResizeEdgeBase)`
  bottom: 16px;
  cursor: ew-resize;
  right: -3px;
  top: 16px;
  width: 6px;
`;

const ResizeCornerBase = styled.div`
  height: 16px;
  position: absolute;
  width: 16px;
  z-index: 5;
`;
const ResizeCornerTopLeft = styled(ResizeCornerBase)`
  cursor: nwse-resize;
  left: -4px;
  top: -4px;
`;
const ResizeCornerTopRight = styled(ResizeCornerBase)`
  cursor: nesw-resize;
  right: -4px;
  top: -4px;
`;
const ResizeCornerBottomLeft = styled(ResizeCornerBase)`
  bottom: -4px;
  cursor: nesw-resize;
  left: -4px;
`;
const ResizeCornerBottomRight = styled(ResizeCornerBase)`
  bottom: -4px;
  cursor: nwse-resize;
  right: -4px;
`;

type DraggableAppWindowProps = {
  children: ReactNode;
};

export const DraggableAppWindow = ({ children }: DraggableAppWindowProps) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);

  const [position, setPosition] = useState<Position | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const { activate, zIndex } = useWindowOrder(WINDOW_ID);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const parent = shell?.parentElement as HTMLElement | null;
    if (!parent) {
      return;
    }
    const parentRect = parent.getBoundingClientRect();

    if (parentRect.width < MOBILE_PARENT_BREAKPOINT) {
      const mobileWidth = Math.min(parentRect.width, 320);
      const mobileHeight = Math.min(
        parentRect.height,
        mobileWidth / INITIAL_ASPECT_RATIO + 100,
      );
      setSize({ width: mobileWidth, height: mobileHeight });
      setPosition({ left: 0, top: 0 });
      return;
    }

    const initialWidth = Math.min(parentRect.width, INITIAL_MAX_WIDTH);
    const initialHeight = Math.min(
      parentRect.height,
      initialWidth / INITIAL_ASPECT_RATIO,
    );

    setSize({ width: initialWidth, height: initialHeight });
    setPosition({
      left: Math.max(0, (parentRect.width - initialWidth) / 2),
      top: MIN_EDGE_GAP,
    });
  }, []);

  const getParentRect = useCallback(() => {
    const parent = shellRef.current?.parentElement as HTMLElement | null;
    return parent?.getBoundingClientRect() ?? null;
  }, []);

  const clampPosition = useCallback(
    (candidateLeft: number, candidateTop: number, currentSize: Size) => {
      const parentRect = getParentRect();
      if (!parentRect) {
        return { left: candidateLeft, top: candidateTop };
      }
      const maxLeft = parentRect.width - currentSize.width - MIN_EDGE_GAP;
      const maxTop = parentRect.height - currentSize.height - MIN_EDGE_GAP;
      return {
        left: Math.min(Math.max(candidateLeft, MIN_EDGE_GAP), maxLeft),
        top: Math.min(Math.max(candidateTop, MIN_EDGE_GAP), maxTop),
      };
    },
    [getParentRect],
  );

  const handleDragStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        target.closest('button, a, input, textarea, select, [role="button"]')
      ) {
        return;
      }
      if (!position) {
        return;
      }

      event.preventDefault();
      activate();

      const shell = shellRef.current;
      shell?.setPointerCapture?.(event.pointerId);
      dragStateRef.current = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        startLeft: position.left,
        startTop: position.top,
      };
      setIsDragging(true);
    },
    [activate, position],
  );

  const latestPositionRef = useRef<Position | null>(position);
  const latestSizeRef = useRef<Size | null>(size);
  useEffect(() => {
    latestPositionRef.current = position;
  }, [position]);
  useEffect(() => {
    latestSizeRef.current = size;
  }, [size]);

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    const handleMove = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId || !size) {
        return;
      }
      const nextLeft = state.startLeft + (event.clientX - state.originX);
      const nextTop = state.startTop + (event.clientY - state.originY);
      const clamped = clampPosition(nextLeft, nextTop, size);
      latestPositionRef.current = clamped;
      const shell = shellRef.current;
      if (shell !== null) {
        shell.style.transform = `translate3d(${clamped.left}px, ${clamped.top}px, 0)`;
      }
    };

    const stop = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      dragStateRef.current = null;
      setIsDragging(false);
      const committed = latestPositionRef.current;
      if (committed !== null) {
        setPosition(committed);
      }
      shellRef.current?.releasePointerCapture?.(event.pointerId);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [clampPosition, isDragging, size]);

  const startResize = useCallback(
    (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }
      if (!position || !size) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      activate();

      const shell = shellRef.current;
      shell?.setPointerCapture?.(event.pointerId);
      resizeStateRef.current = {
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY,
        startWidth: size.width,
        startHeight: size.height,
        startLeft: position.left,
        startTop: position.top,
        handle,
      };
      setIsResizing(true);
    },
    [activate, position, size],
  );

  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }

    const handleMove = (event: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      const parentRect = getParentRect();
      if (!parentRect) {
        return;
      }

      const deltaX = event.clientX - state.originX;
      const deltaY = event.clientY - state.originY;

      const affectsWidth = HORIZONTAL_HANDLES.has(state.handle);
      const affectsHeight = VERTICAL_HANDLES.has(state.handle);
      const growsFromLeft = LEFT_HANDLES.has(state.handle);
      const growsFromTop = TOP_HANDLES.has(state.handle);

      const effectiveMinWidth = Math.min(
        MIN_WIDTH,
        Math.max(parentRect.width - MIN_EDGE_GAP * 2, 0),
      );
      const effectiveMinHeight = Math.min(
        MIN_HEIGHT,
        Math.max(parentRect.height - MIN_EDGE_GAP * 2, 0),
      );

      let nextWidth = state.startWidth;
      let nextLeft = state.startLeft;
      if (affectsWidth) {
        if (growsFromLeft) {
          const maxWidth = state.startWidth + state.startLeft - MIN_EDGE_GAP;
          nextWidth = Math.min(
            Math.max(state.startWidth - deltaX, effectiveMinWidth),
            Math.max(maxWidth, effectiveMinWidth),
          );
          nextLeft = state.startLeft + state.startWidth - nextWidth;
        } else {
          const maxWidth = parentRect.width - state.startLeft - MIN_EDGE_GAP;
          nextWidth = Math.min(
            Math.max(state.startWidth + deltaX, effectiveMinWidth),
            Math.max(maxWidth, effectiveMinWidth),
          );
        }
      }

      let nextHeight = state.startHeight;
      let nextTop = state.startTop;
      if (affectsHeight) {
        if (growsFromTop) {
          const maxHeight = state.startHeight + state.startTop - MIN_EDGE_GAP;
          nextHeight = Math.min(
            Math.max(state.startHeight - deltaY, effectiveMinHeight),
            Math.max(maxHeight, effectiveMinHeight),
          );
          nextTop = state.startTop + state.startHeight - nextHeight;
        } else {
          const maxHeight = parentRect.height - state.startTop - MIN_EDGE_GAP;
          nextHeight = Math.min(
            Math.max(state.startHeight + deltaY, effectiveMinHeight),
            Math.max(maxHeight, effectiveMinHeight),
          );
        }
      }

      latestSizeRef.current = { width: nextWidth, height: nextHeight };
      latestPositionRef.current = { left: nextLeft, top: nextTop };
      const shell = shellRef.current;
      if (shell !== null) {
        shell.style.width = `${nextWidth}px`;
        shell.style.height = `${nextHeight}px`;
        shell.style.transform = `translate3d(${nextLeft}px, ${nextTop}px, 0)`;
      }
    };

    const stop = (event: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      resizeStateRef.current = null;
      setIsResizing(false);
      const committedSize = latestSizeRef.current;
      const committedPosition = latestPositionRef.current;
      if (committedSize !== null) {
        setSize(committedSize);
      }
      if (committedPosition !== null) {
        setPosition(committedPosition);
      }
      shellRef.current?.releasePointerCapture?.(event.pointerId);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [getParentRect, isResizing]);

  const handleShellPointerDown = useCallback(() => {
    activate();
  }, [activate]);

  const isReady = position !== null && size !== null;

  const isInteracting = isDragging || isResizing;
  const renderPosition = isInteracting
    ? (latestPositionRef.current ?? position)
    : position;
  const renderSize = isInteracting ? (latestSizeRef.current ?? size) : size;

  return (
    <Shell
      $isActive={isReady && zIndex > 2}
      $isReady={isReady}
      $isResizing={isResizing}
      onPointerDown={handleShellPointerDown}
      ref={shellRef}
      style={{
        height: renderSize ? `${renderSize.height}px` : undefined,
        transform: renderPosition
          ? `translate3d(${renderPosition.left}px, ${renderPosition.top}px, 0)`
          : 'translate3d(0, 0, 0)',
        width: renderSize ? `${renderSize.width}px` : '100%',
        zIndex,
      }}
    >
      <ResizeEdgeTop onPointerDown={startResize('top')} />
      <ResizeEdgeRight onPointerDown={startResize('right')} />
      <ResizeEdgeBottom onPointerDown={startResize('bottom')} />
      <ResizeEdgeLeft onPointerDown={startResize('left')} />
      <ResizeCornerTopLeft
        aria-hidden
        onPointerDown={startResize('top-left')}
      />
      <ResizeCornerTopRight
        aria-hidden
        onPointerDown={startResize('top-right')}
      />
      <ResizeCornerBottomLeft
        aria-hidden
        onPointerDown={startResize('bottom-left')}
      />
      <ResizeCornerBottomRight
        aria-hidden
        onPointerDown={startResize('bottom-right')}
      />
      <MacWindowBar isDragging={isDragging} onDragStart={handleDragStart} />
      <Content>{children}</Content>
    </Shell>
  );
};
