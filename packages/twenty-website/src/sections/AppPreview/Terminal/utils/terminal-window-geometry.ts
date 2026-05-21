import type {
  WindowBounds,
  WindowPosition,
  WindowSize,
} from '../../WindowInteraction/window-geometry';
import type { TerminalToggleValue } from '../types/terminal-toggle-types';

export const TERMINAL_INITIAL_WIDTH = 380;
export const TERMINAL_INITIAL_HEIGHT = 220;
export const TERMINAL_CHAT_EXPANDED_HEIGHT = 480;
export const TERMINAL_EDITOR_WIDTH = 720;
export const TERMINAL_EDITOR_HEIGHT = 480;
export const TERMINAL_MIN_WIDTH = 300;
export const TERMINAL_MIN_HEIGHT = 200;
export const TERMINAL_INITIAL_BOTTOM_OFFSET = 96;
export const TERMINAL_EDGE_GAP = 0;
export const TERMINAL_MOBILE_PARENT_BREAKPOINT = 640;
export const TERMINAL_MOBILE_OFFSET_X = 16;
export const TERMINAL_MOBILE_OFFSET_Y = 48;

type TargetTerminalSizeInput = {
  bounds: WindowBounds | null;
  chatStarted: boolean;
  view: TerminalToggleValue;
};

type AnchoredResizeInput = {
  bounds: WindowBounds | null;
  currentPosition: WindowPosition | null;
  currentSize: WindowSize;
  targetSize: WindowSize;
};

export const isTerminalMobileBounds = (bounds: WindowBounds | null) =>
  bounds !== null && bounds.width < TERMINAL_MOBILE_PARENT_BREAKPOINT;

const getTerminalAvailableSize = (bounds: WindowBounds | null): WindowSize => {
  if (!bounds) {
    return {
      width: Infinity,
      height: Infinity,
    };
  }

  const isMobile = isTerminalMobileBounds(bounds);

  return {
    width: Math.max(
      bounds.width - (isMobile ? TERMINAL_MOBILE_OFFSET_X : 0),
      0,
    ),
    height: Math.max(
      bounds.height - (isMobile ? TERMINAL_MOBILE_OFFSET_Y : 0),
      0,
    ),
  };
};

export const getTerminalTargetSize = ({
  bounds,
  chatStarted,
  view,
}: TargetTerminalSizeInput): WindowSize => {
  const availableSize = getTerminalAvailableSize(bounds);

  if (view === 'editor') {
    return {
      width: Math.min(TERMINAL_EDITOR_WIDTH, availableSize.width),
      height: Math.min(TERMINAL_EDITOR_HEIGHT, availableSize.height),
    };
  }

  return {
    width: Math.min(TERMINAL_INITIAL_WIDTH, availableSize.width),
    height: Math.min(
      chatStarted ? TERMINAL_CHAT_EXPANDED_HEIGHT : TERMINAL_INITIAL_HEIGHT,
      availableSize.height,
    ),
  };
};

export const getInitialTerminalLayout = (
  bounds: WindowBounds,
): {
  position: WindowPosition;
  size: WindowSize;
} => {
  if (isTerminalMobileBounds(bounds)) {
    const size = {
      width: Math.min(
        TERMINAL_INITIAL_WIDTH,
        Math.max(bounds.width - TERMINAL_MOBILE_OFFSET_X, 0),
      ),
      height: Math.min(
        TERMINAL_INITIAL_HEIGHT,
        Math.max(bounds.height - TERMINAL_MOBILE_OFFSET_Y, 0),
      ),
    };

    return {
      position: {
        left: TERMINAL_MOBILE_OFFSET_X,
        top: TERMINAL_MOBILE_OFFSET_Y,
      },
      size,
    };
  }

  const size = {
    width: Math.min(TERMINAL_INITIAL_WIDTH, bounds.width),
    height: Math.min(TERMINAL_INITIAL_HEIGHT, bounds.height),
  };

  return {
    position: {
      left: Math.max(0, bounds.width - size.width),
      top: Math.max(
        0,
        bounds.height - size.height - TERMINAL_INITIAL_BOTTOM_OFFSET,
      ),
    },
    size,
  };
};

export const getAnchoredTerminalResizeLayout = ({
  bounds,
  currentPosition,
  currentSize,
  targetSize,
}: AnchoredResizeInput): {
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

  if (!currentPosition) {
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
