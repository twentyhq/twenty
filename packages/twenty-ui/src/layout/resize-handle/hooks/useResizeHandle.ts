import { useState, type PointerEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

const RESIZE_MIN_SIZE = 50;
const RESIZE_MAX_SIZE = 500;

export const useResizeHandle = ({
  initialSize,
  axis = 'y',
}: {
  initialSize: number;
  axis?: 'x' | 'y';
}) => {
  const [size, setSize] = useState(initialSize);
  const [resizeStartState, setResizeStartState] = useState<{
    startPosition: number;
    startSize: number;
  } | null>(null);

  const handleResizeStart = (event: PointerEvent) => {
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    const startPosition = axis === 'y' ? event.clientY : event.clientX;
    setResizeStartState({ startPosition, startSize: size });
  };

  const handleResizeMove = (event: PointerEvent) => {
    if (!isDefined(resizeStartState)) {
      return;
    }
    const currentPosition = axis === 'y' ? event.clientY : event.clientX;
    const delta = currentPosition - resizeStartState.startPosition;
    const newSize = Math.min(
      RESIZE_MAX_SIZE,
      Math.max(RESIZE_MIN_SIZE, resizeStartState.startSize + delta),
    );
    setSize(newSize);
  };

  const handleResizeEnd = () => {
    setResizeStartState(null);
  };

  return { size, handleResizeStart, handleResizeMove, handleResizeEnd };
};
