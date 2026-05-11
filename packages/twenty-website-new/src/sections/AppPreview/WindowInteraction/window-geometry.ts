export type WindowPosition = {
  left: number;
  top: number;
};

export type WindowSize = {
  height: number;
  width: number;
};

type ResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type ResizeEdge = 'top' | 'right' | 'bottom' | 'left';

export type WindowResizeHandle = ResizeCorner | ResizeEdge;

export type WindowDragState = {
  originX: number;
  originY: number;
  pointerId: number;
  startLeft: number;
  startTop: number;
};

export type WindowResizeState = WindowDragState & {
  handle: WindowResizeHandle;
  startHeight: number;
  startWidth: number;
};

export type WindowBounds = {
  height: number;
  width: number;
};

type ClampWindowPositionInput = {
  bounds: WindowBounds;
  candidate: WindowPosition;
  edgeGap: number;
  size: WindowSize;
};

type ResizeWindowInput = {
  bounds: WindowBounds;
  edgeGap: number;
  minSize: WindowSize;
  pointerX: number;
  pointerY: number;
  state: WindowResizeState;
};

const HORIZONTAL_HANDLES: ReadonlySet<WindowResizeHandle> = new Set([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'left',
  'right',
]);

const VERTICAL_HANDLES: ReadonlySet<WindowResizeHandle> = new Set([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'top',
  'bottom',
]);

const LEFT_HANDLES: ReadonlySet<WindowResizeHandle> = new Set([
  'top-left',
  'bottom-left',
  'left',
]);

const TOP_HANDLES: ReadonlySet<WindowResizeHandle> = new Set([
  'top-left',
  'top-right',
  'top',
]);

export const clampWindowPosition = ({
  bounds,
  candidate,
  edgeGap,
  size,
}: ClampWindowPositionInput): WindowPosition => {
  const maxLeft = bounds.width - size.width - edgeGap;
  const maxTop = bounds.height - size.height - edgeGap;

  return {
    left: Math.min(Math.max(candidate.left, edgeGap), maxLeft),
    top: Math.min(Math.max(candidate.top, edgeGap), maxTop),
  };
};

export const resizeWindowFromPointer = ({
  bounds,
  edgeGap,
  minSize,
  pointerX,
  pointerY,
  state,
}: ResizeWindowInput): {
  position: WindowPosition;
  size: WindowSize;
} => {
  const deltaX = pointerX - state.originX;
  const deltaY = pointerY - state.originY;

  const affectsWidth = HORIZONTAL_HANDLES.has(state.handle);
  const affectsHeight = VERTICAL_HANDLES.has(state.handle);
  const growsFromLeft = LEFT_HANDLES.has(state.handle);
  const growsFromTop = TOP_HANDLES.has(state.handle);

  const effectiveMinWidth = Math.min(
    minSize.width,
    Math.max(bounds.width - edgeGap * 2, 0),
  );
  const effectiveMinHeight = Math.min(
    minSize.height,
    Math.max(bounds.height - edgeGap * 2, 0),
  );

  let nextWidth = state.startWidth;
  let nextLeft = state.startLeft;

  if (affectsWidth) {
    if (growsFromLeft) {
      const maxWidth = state.startWidth + state.startLeft - edgeGap;
      nextWidth = Math.min(
        Math.max(state.startWidth - deltaX, effectiveMinWidth),
        Math.max(maxWidth, effectiveMinWidth),
      );
      nextLeft = state.startLeft + state.startWidth - nextWidth;
    } else {
      const maxWidth = bounds.width - state.startLeft - edgeGap;
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
      const maxHeight = state.startHeight + state.startTop - edgeGap;
      nextHeight = Math.min(
        Math.max(state.startHeight - deltaY, effectiveMinHeight),
        Math.max(maxHeight, effectiveMinHeight),
      );
      nextTop = state.startTop + state.startHeight - nextHeight;
    } else {
      const maxHeight = bounds.height - state.startTop - edgeGap;
      nextHeight = Math.min(
        Math.max(state.startHeight + deltaY, effectiveMinHeight),
        Math.max(maxHeight, effectiveMinHeight),
      );
    }
  }

  return {
    position: { left: nextLeft, top: nextTop },
    size: { width: nextWidth, height: nextHeight },
  };
};
