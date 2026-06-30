'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import { useTimeoutRegistry } from '../stage/use-timeout-registry';
import { useWindowOrder } from '../stage/use-window-order';
import { useWindowPointerInteractions } from '../stage/use-window-pointer-interactions';
import { type WindowPosition, type WindowSize } from '../stage/window-geometry';
import { type TerminalView } from './conversation-core';
import { terminalWindowGeometry } from './terminal-window-geometry';

const TERMINAL_WINDOW_ID = 'terminal-window';
// Mount lays the window out without springing into place.
const ANIMATION_ENABLE_DELAY_MS = 150;

export const useTerminalWindowLayout = () => {
  const timeoutRegistry = useTimeoutRegistry();
  const shellRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<WindowPosition | null>(null);
  const [size, setSize] = useState<WindowSize>({
    width: terminalWindowGeometry.initialWidth,
    height: terminalWindowGeometry.initialHeight,
  });
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const { activate, zIndex } = useWindowOrder(TERMINAL_WINDOW_ID);

  useEffect(() => {
    const cancelAnimationEnable = timeoutRegistry.schedule(() => {
      setAnimationsEnabled(true);
    }, ANIMATION_ENABLE_DELAY_MS);

    return () => cancelAnimationEnable();
  }, [timeoutRegistry]);

  const getParentBounds = useCallback(() => {
    const shell = shellRef.current;
    const parent = shell?.parentElement as HTMLElement | null;

    return parent?.getBoundingClientRect() ?? null;
  }, []);

  useLayoutEffect(() => {
    const parentBounds = getParentBounds();

    if (parentBounds === null) {
      return;
    }

    const initialLayout = terminalWindowGeometry.getInitialLayout(parentBounds);
    setSize(initialLayout.size);
    setPosition(initialLayout.position);
  }, [getParentBounds]);

  const resizeToTerminalTarget = useCallback(
    ({ chatStarted, view }: { chatStarted: boolean; view: TerminalView }) => {
      const bounds = getParentBounds();
      const targetSize = terminalWindowGeometry.getTargetSize({
        bounds,
        chatStarted,
        view,
      });
      const next = terminalWindowGeometry.getAnchoredResizeLayout({
        bounds,
        currentPosition: position,
        currentSize: size,
        targetSize,
      });

      setSize(next.size);
      setPosition(next.position);
    },
    [getParentBounds, position, size],
  );

  const {
    handleDragStart,
    isDragging,
    isResizing,
    latestPositionRef,
    latestSizeRef,
    startResize,
  } = useWindowPointerInteractions({
    activate,
    blockedDragTargetSelector: 'button',
    edgeGap: terminalWindowGeometry.edgeGap,
    getBounds: getParentBounds,
    minSize: {
      width: terminalWindowGeometry.minWidth,
      height: terminalWindowGeometry.minHeight,
    },
    position,
    setPosition,
    setSize,
    shellRef,
    size,
  });

  const isInteracting = isDragging || isResizing;
  const renderPosition = isInteracting
    ? (latestPositionRef.current ?? position)
    : position;
  const renderSize = isInteracting ? (latestSizeRef.current ?? size) : size;

  const windowStyle: CSSProperties = {
    height: `${renderSize.height}px`,
    transform:
      renderPosition !== null
        ? `translate3d(${renderPosition.left}px, ${renderPosition.top}px, 0)`
        : 'translate3d(0, 0, 0)',
    width: `${renderSize.width}px`,
    zIndex,
  };

  return {
    activate,
    animationsEnabled,
    handleDragStart,
    isDragging,
    isReady: position !== null,
    isResizing,
    resizeToTerminalTarget,
    shellRef,
    startResize,
    windowStyle,
  };
};
