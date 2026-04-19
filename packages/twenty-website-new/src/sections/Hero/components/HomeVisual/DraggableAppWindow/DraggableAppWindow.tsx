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
// Initial size cap — the hero scene is 1280×832, so we reuse that ratio to
// keep the window looking like the Twenty app when it's shrunk to fit.
const INITIAL_MAX_WIDTH = 1040;
const INITIAL_ASPECT_RATIO = 1280 / 832;
// Below this parent width, stack App Window + Terminal with a small diagonal
// offset so both remain clickable on mobile.
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

  // On mount, size the window to match the hero scene so it occupies the
  // same visual footprint as before. Stored in state so drag/resize can move
  // and shrink it freely afterwards.
  useLayoutEffect(() => {
    const shell = shellRef.current;
    const parent = shell?.parentElement as HTMLElement | null;
    if (!parent) {
      return;
    }
    const parentRect = parent.getBoundingClientRect();

    if (parentRect.width < MOBILE_PARENT_BREAKPOINT) {
      // Mobile: pin the App Window to the top of the scene. The Terminal sits
      // tightly on top of it with only a small diagonal offset peeking out.
      const mobileWidth = Math.min(parentRect.width, 320);
      const mobileHeight = Math.min(
        parentRect.height,
        mobileWidth / INITIAL_ASPECT_RATIO + 100,
      );
      setSize({ width: mobileWidth, height: mobileHeight });
      setPosition({ left: 0, top: 0 });
      return;
    }

    // Cap the initial width so the window reads as a macOS app resting inside
    // the hero rather than filling it edge-to-edge. Height follows the hero's
    // aspect ratio so the app layout isn't letterboxed.
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
      setPosition(clampPosition(nextLeft, nextTop, size));
    };

    const stop = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      dragStateRef.current = null;
      setIsDragging(false);
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

      // Mobile parents can be narrower than MIN_WIDTH; clamp the min against
      // the parent so resize can't demand more room than exists.
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
          // Left edge can't cross past MIN_EDGE_GAP, which caps width at
          // startLeft + startWidth - MIN_EDGE_GAP.
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

      setSize({ width: nextWidth, height: nextHeight });
      setPosition({ left: nextLeft, top: nextTop });
    };

    const stop = (event: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state || state.pointerId !== event.pointerId) {
        return;
      }
      resizeStateRef.current = null;
      setIsResizing(false);
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

  // Any pointer-down on the window activates it; the MacWindowBar owns the
  // drag affordance separately so content clicks don't pull the window.
  const handleShellPointerDown = useCallback(() => {
    activate();
  }, [activate]);

  const isReady = position !== null && size !== null;

  return (
    <Shell
      $isActive={isReady && zIndex > 2}
      $isReady={isReady}
      $isResizing={isResizing}
      onPointerDown={handleShellPointerDown}
      ref={shellRef}
      style={{
        height: size ? `${size.height}px` : undefined,
        transform: position
          ? `translate(${position.left}px, ${position.top}px)`
          : 'translate(0, 0)',
        width: size ? `${size.width}px` : '100%',
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
