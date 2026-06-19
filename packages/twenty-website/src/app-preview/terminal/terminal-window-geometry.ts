import {
  type WindowBounds,
  type WindowPosition,
  type WindowSize,
} from '../stage/window-geometry';
import { type TerminalView } from './conversation-core';

const INITIAL_WIDTH = 380;
const INITIAL_HEIGHT = 220;
const CHAT_EXPANDED_HEIGHT = 480;
const EDITOR_WIDTH = 720;
const EDITOR_HEIGHT = 480;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
// The terminal intentionally hangs past the scene's right edge at rest.
const INITIAL_BOTTOM_OFFSET = 32;
const INITIAL_RIGHT_OFFSET = 148;
const EDGE_GAP = 0;
const MOBILE_PARENT_BREAKPOINT = 640;
const MOBILE_OFFSET_X = 16;
const MOBILE_OFFSET_Y = 48;

const isMobileBounds = (bounds: WindowBounds | null) =>
  bounds !== null && bounds.width < MOBILE_PARENT_BREAKPOINT;

const getAvailableSize = (bounds: WindowBounds | null): WindowSize => {
  if (bounds === null) {
    return {
      width: Infinity,
      height: Infinity,
    };
  }

  const isMobile = isMobileBounds(bounds);

  return {
    width: Math.max(bounds.width - (isMobile ? MOBILE_OFFSET_X : 0), 0),
    height: Math.max(bounds.height - (isMobile ? MOBILE_OFFSET_Y : 0), 0),
  };
};

const getTargetSize = ({
  bounds,
  chatStarted,
  view,
}: {
  bounds: WindowBounds | null;
  chatStarted: boolean;
  view: TerminalView;
}): WindowSize => {
  const availableSize = getAvailableSize(bounds);

  if (view === 'editor') {
    return {
      width: Math.min(EDITOR_WIDTH, availableSize.width),
      height: Math.min(EDITOR_HEIGHT, availableSize.height),
    };
  }

  return {
    width: Math.min(INITIAL_WIDTH, availableSize.width),
    height: Math.min(
      chatStarted ? CHAT_EXPANDED_HEIGHT : INITIAL_HEIGHT,
      availableSize.height,
    ),
  };
};

const getInitialLayout = (
  bounds: WindowBounds,
): {
  position: WindowPosition;
  size: WindowSize;
} => {
  if (isMobileBounds(bounds)) {
    const size = {
      width: Math.min(
        INITIAL_WIDTH,
        Math.max(bounds.width - MOBILE_OFFSET_X, 0),
      ),
      height: Math.min(
        INITIAL_HEIGHT,
        Math.max(bounds.height - MOBILE_OFFSET_Y, 0),
      ),
    };

    return {
      position: {
        left: MOBILE_OFFSET_X,
        top: MOBILE_OFFSET_Y,
      },
      size,
    };
  }

  const size = {
    width: Math.min(INITIAL_WIDTH, bounds.width),
    height: Math.min(INITIAL_HEIGHT, bounds.height),
  };

  return {
    position: {
      left: Math.max(0, bounds.width - size.width + INITIAL_RIGHT_OFFSET),
      top: Math.max(0, bounds.height - size.height - INITIAL_BOTTOM_OFFSET),
    },
    size,
  };
};

// Spring-grow keeps the window's dominant corner pinned: the half of the
// parent the window's center sits in decides which edges stay put.
const getAnchoredResizeLayout = ({
  bounds,
  currentPosition,
  currentSize,
  targetSize,
}: {
  bounds: WindowBounds | null;
  currentPosition: WindowPosition | null;
  currentSize: WindowSize;
  targetSize: WindowSize;
}): {
  position: WindowPosition | null;
  size: WindowSize;
} => {
  if (
    currentSize.height === targetSize.height &&
    currentSize.width === targetSize.width
  ) {
    return {
      position: currentPosition,
      size: currentSize,
    };
  }

  if (currentPosition === null) {
    return {
      position: currentPosition,
      size: targetSize,
    };
  }

  const parentWidth = bounds?.width ?? currentSize.width;
  const parentHeight = bounds?.height ?? currentSize.height;
  const centerX = currentPosition.left + currentSize.width / 2;
  const centerY = currentPosition.top + currentSize.height / 2;
  const anchorRight = centerX > parentWidth / 2;
  const anchorBottom = centerY > parentHeight / 2;

  return {
    position: {
      left: anchorRight
        ? currentPosition.left + currentSize.width - targetSize.width
        : currentPosition.left,
      top: anchorBottom
        ? currentPosition.top + currentSize.height - targetSize.height
        : currentPosition.top,
    },
    size: targetSize,
  };
};

export const terminalWindowGeometry = {
  initialWidth: INITIAL_WIDTH,
  initialHeight: INITIAL_HEIGHT,
  minWidth: MIN_WIDTH,
  minHeight: MIN_HEIGHT,
  edgeGap: EDGE_GAP,
  getAnchoredResizeLayout,
  getInitialLayout,
  getTargetSize,
  isMobileBounds,
};
