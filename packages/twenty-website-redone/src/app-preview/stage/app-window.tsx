'use client';

import { styled } from '@linaria/react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { mediaUp } from '@/tokens';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { useWindowOrder } from './use-window-order';
import { useWindowPointerInteractions } from './use-window-pointer-interactions';
import { WindowBar } from './window-bar';
import { type WindowPosition, type WindowSize } from './window-geometry';

const WINDOW_ID = 'twenty-app-window';
const MIN_WIDTH = 640;
const MIN_HEIGHT = 420;
const MIN_EDGE_GAP = 0;
const INITIAL_MAX_WIDTH = APP_PREVIEW_STAGE.windowScene.widthPx;

const Shell = styled.div<{ $isActive: boolean; $isReady: boolean }>`
  background-color: ${APP_PREVIEW_THEME.background.primary};
  background-image: url('${APP_PREVIEW_STAGE.frame.noiseImageUrl}');
  border: 1px solid ${APP_PREVIEW_THEME.border.color.medium};
  border-radius: ${APP_PREVIEW_STAGE.frame.borderRadiusPx}px;
  box-shadow: ${({ $isActive }) =>
    $isActive
      ? APP_PREVIEW_STAGE.shadow.mobileElevated
      : APP_PREVIEW_STAGE.shadow.mobileResting};
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

  ${mediaUp('md')} {
    box-shadow: ${({ $isActive }) =>
      $isActive
        ? APP_PREVIEW_STAGE.shadow.elevated
        : APP_PREVIEW_STAGE.shadow.resting};
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

export function AppWindow({ children }: { children: ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const [position, setPosition] = useState<WindowPosition | null>(null);
  const [size, setSize] = useState<WindowSize | null>(null);
  const { activate, zIndex } = useWindowOrder(WINDOW_ID);

  const recalcLayout = () => {
    const shell = shellRef.current;
    const parent = shell?.parentElement;
    if (!parent) {
      return;
    }
    const parentRect = parent.getBoundingClientRect();
    const newWidth = INITIAL_MAX_WIDTH;
    const newHeight = parentRect.height;
    setSize({ width: newWidth, height: newHeight });
    setPosition({
      left: Math.max(0, (parentRect.width - newWidth) / 2),
      top: MIN_EDGE_GAP,
    });
  };

  useLayoutEffect(() => {
    recalcLayout();
    const parent = shellRef.current?.parentElement;
    if (!parent) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (!interactingRef.current) {
        recalcLayout();
      }
    });
    observer.observe(parent);
    return () => observer.disconnect();
    // recalcLayout reads only refs; mount-time wiring is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getParentRect = () => {
    const parent = shellRef.current?.parentElement;
    return parent?.getBoundingClientRect() ?? null;
  };

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

  const isReady = position !== null && size !== null;
  const isInteracting = isDragging || isResizing;
  interactingRef.current = isInteracting;
  const renderPosition = isInteracting
    ? (latestPositionRef.current ?? position)
    : position;
  const renderSize = isInteracting ? (latestSizeRef.current ?? size) : size;

  return (
    <Shell
      $isActive={isReady && zIndex > 2}
      $isReady={isReady}
      data-app-window=""
      onPointerDown={activate}
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
      <WindowBar isDragging={isDragging} onDragStart={handleDragStart} />
      <Content>{children}</Content>
    </Shell>
  );
}
