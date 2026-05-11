import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useTimeoutRegistry } from '@/lib/react';
import { useWindowPointerInteractions } from '../../WindowInteraction/use-window-pointer-interactions';
import type {
  WindowPosition as TerminalPosition,
  WindowSize as TerminalSize,
} from '../../WindowInteraction/window-geometry';
import { useWindowOrder } from '../../WindowOrder/use-window-order';
import type { TerminalToggleValue } from '../types/terminal-toggle-types';
import {
  getAnchoredTerminalResizeLayout,
  getInitialTerminalLayout,
  getTerminalTargetSize,
  TERMINAL_EDGE_GAP,
  TERMINAL_INITIAL_HEIGHT,
  TERMINAL_INITIAL_WIDTH,
  TERMINAL_MIN_HEIGHT,
  TERMINAL_MIN_WIDTH,
} from '../utils/terminal-window-geometry';

const TERMINAL_WINDOW_ID = 'terminal-window';
const TERMINAL_ANIMATION_ENABLE_DELAY = 150;

type ResizeToTerminalTargetInput = {
  chatStarted: boolean;
  view: TerminalToggleValue;
};

export const useTerminalWindowLayout = () => {
  const timeoutRegistry = useTimeoutRegistry();
  const shellRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<TerminalPosition | null>(null);
  const [size, setSize] = useState<TerminalSize>({
    width: TERMINAL_INITIAL_WIDTH,
    height: TERMINAL_INITIAL_HEIGHT,
  });
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const { activate, zIndex } = useWindowOrder(TERMINAL_WINDOW_ID);

  useEffect(() => {
    const cancelAnimationEnable = timeoutRegistry.schedule(() => {
      setAnimationsEnabled(true);
    }, TERMINAL_ANIMATION_ENABLE_DELAY);

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

    const initialLayout = getInitialTerminalLayout(parentBounds);
    setSize(initialLayout.size);
    setPosition(initialLayout.position);
  }, [getParentBounds]);

  const resizeToTerminalTarget = useCallback(
    ({ chatStarted, view }: ResizeToTerminalTargetInput) => {
      const bounds = getParentBounds();
      const targetSize = getTerminalTargetSize({
        bounds,
        chatStarted,
        view,
      });
      const next = getAnchoredTerminalResizeLayout({
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
    edgeGap: TERMINAL_EDGE_GAP,
    getBounds: getParentBounds,
    minSize: {
      width: TERMINAL_MIN_WIDTH,
      height: TERMINAL_MIN_HEIGHT,
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
