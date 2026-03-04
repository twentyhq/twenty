import { useState } from 'react';
import type { PointerEvent } from 'react';

const CODE_EDITOR_RESIZE_MIN_HEIGHT = 50;
const CODE_EDITOR_RESIZE_MAX_HEIGHT = 500;

export const useResizableEditor = ({
  initialHeight,
}: {
  initialHeight: number;
}) => {
  const [height, setHeight] = useState(initialHeight);
  const [resizeStartState, setResizeStartState] = useState<{
    startY: number;
    startHeight: number;
  } | null>(null);

  const handleResizeStart = (event: PointerEvent) => {
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    setResizeStartState({ startY: event.clientY, startHeight: height });
  };

  const handleResizeMove = (event: PointerEvent) => {
    if (!resizeStartState) return;
    const delta = event.clientY - resizeStartState.startY;
    const newHeight = Math.min(
      CODE_EDITOR_RESIZE_MAX_HEIGHT,
      Math.max(CODE_EDITOR_RESIZE_MIN_HEIGHT, resizeStartState.startHeight + delta),
    );
    setHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setResizeStartState(null);
  };

  return { height, handleResizeStart, handleResizeMove, handleResizeEnd };
};
