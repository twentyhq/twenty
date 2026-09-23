import { useDirection } from '@base-ui/react/direction-provider';
import { clamp } from '@base-ui/utils/clamp';
import { type KeyboardEvent, type PointerEvent, useRef } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

type ResizeGesture = {
  pointerId: number;
  startPosition: number;
  startValue: number;
};

type UseResizeHandleInteractionArgs = {
  axis: 'x' | 'y';
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
};

export const useResizeHandleInteraction = ({
  axis,
  value,
  onValueChange,
  min,
  max,
  step,
  disabled,
}: UseResizeHandleInteractionArgs) => {
  const direction = useDirection();
  const isHorizontalRtl = axis === 'x' && direction === 'rtl';
  const gestureRef = useRef<ResizeGesture | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      disabled ||
      event.defaultPrevented ||
      event.button !== 0 ||
      isDefined(gestureRef.current)
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.focus?.();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    gestureRef.current = {
      pointerId: event.pointerId,
      startPosition: axis === 'y' ? event.clientY : event.clientX,
      startValue: value,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;

    if (
      disabled ||
      event.defaultPrevented ||
      !isDefined(gesture) ||
      gesture.pointerId !== event.pointerId
    ) {
      return;
    }

    const position = axis === 'y' ? event.clientY : event.clientX;
    const delta =
      (position - gesture.startPosition) * (isHorizontalRtl ? -1 : 1);
    const nextValue = clamp(gesture.startValue + delta, min, max);

    onValueChange(nextValue);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (gestureRef.current?.pointerId !== event.pointerId) {
      return;
    }

    gestureRef.current = null;

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || event.defaultPrevented) {
      return;
    }

    const increaseKey =
      axis === 'y' ? 'ArrowDown' : isHorizontalRtl ? 'ArrowLeft' : 'ArrowRight';
    const decreaseKey =
      axis === 'y' ? 'ArrowUp' : isHorizontalRtl ? 'ArrowRight' : 'ArrowLeft';
    const valueByKey = new Map([
      [increaseKey, value + step],
      [decreaseKey, value - step],
      ['Home', min],
      ['End', max],
    ]);
    const nextValue = valueByKey.get(event.key);

    if (!isDefined(nextValue)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onValueChange(clamp(nextValue, min, max));
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
    onLostPointerCapture: handlePointerEnd,
    onKeyDown: handleKeyDown,
  };
};
