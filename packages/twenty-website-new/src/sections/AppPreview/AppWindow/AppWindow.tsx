'use client';

import { styled } from '@linaria/react';
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { theme } from '@/theme';
import { VISUAL_TOKENS } from '../Shared/utils/app-preview-tokens';
import { useWindowPointerInteractions } from '../WindowInteraction/use-window-pointer-interactions';
import type {
  WindowPosition as Position,
  WindowSize as Size,
} from '../WindowInteraction/window-geometry';
import { useWindowOrder } from '../WindowOrder/use-window-order';
import { WINDOW_SHADOWS } from '../Shared/utils/window-shadows';
import { MacWindowBar } from './MacWindowBar';

const WINDOW_ID = 'twenty-app-window';
const MIN_WIDTH = 640;
const MIN_HEIGHT = 420;
const MIN_EDGE_GAP = 0;
const INITIAL_MAX_WIDTH = 1040;
const INITIAL_ASPECT_RATIO = 1280 / 832;
const MOBILE_PARENT_BREAKPOINT = 640;

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

type AppWindowProps = {
  children: ReactNode;
};

export const AppWindow = ({ children }: AppWindowProps) => {
  const shellRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<Position | null>(null);
  const [size, setSize] = useState<Size | null>(null);

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

  const {
    handleDragStart,
    isDragging,
    isResizing,
    latestPositionRef,
    latestSizeRef,
    startResize,
  } = useWindowPointerInteractions({
    activate,
    blockedDragTargetSelector:
      'button, a, input, textarea, select, [role="button"]',
    edgeGap: MIN_EDGE_GAP,
    getBounds: getParentRect,
    minSize: { width: MIN_WIDTH, height: MIN_HEIGHT },
    position,
    setPosition,
    setSize,
    shellRef,
    size,
  });

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
