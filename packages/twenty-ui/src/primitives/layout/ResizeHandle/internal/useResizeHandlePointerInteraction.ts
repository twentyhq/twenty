import { clamp } from '@base-ui/utils/clamp';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { isFunction } from '@sniptt/guards';
import { type MouseEvent, type PointerEvent, useEffect, useRef } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ResizeHandleProps } from '../types/ResizeHandleProps';

import { type ResizeGesture } from './ResizeGesture';

type UseResizeHandlePointerInteractionArgs = Required<
  Pick<ResizeHandleProps, 'axis' | 'value' | 'min' | 'max' | 'disabled'>
> &
  Pick<
    ResizeHandleProps,
    'onValueCommit' | 'onResizeStart' | 'onResizeEnd' | 'onActivate'
  > & {
    isReversed: boolean;
    onValueChange: (value: number) => void;
    scale: number | (() => number);
    dragThreshold: number;
  };

export const useResizeHandlePointerInteraction = ({
  axis,
  isReversed,
  value,
  onValueChange,
  onValueCommit,
  onResizeStart,
  onResizeEnd,
  onActivate,
  scale,
  dragThreshold,
  min,
  max,
  disabled,
}: UseResizeHandlePointerInteractionArgs) => {
  const gestureRef = useRef<ResizeGesture | null>(null);
  const suppressActivationRef = useRef(false);

  const finishResize = useStableCallback((cancelled: boolean) => {
    const gesture = gestureRef.current;

    if (!isDefined(gesture)) {
      return;
    }

    gestureRef.current = null;
    gesture.removeEscapeKeyListener();
    suppressActivationRef.current = cancelled || gesture.hasStarted;

    if (gesture.target.hasPointerCapture?.(gesture.pointerId)) {
      gesture.target.releasePointerCapture?.(gesture.pointerId);
    }

    if (!gesture.hasStarted) {
      return;
    }

    if (!cancelled) {
      onValueCommit?.(gesture.currentValue);
    }

    onResizeEnd?.({ cancelled, value: gesture.currentValue });
  });

  useEffect(
    () => () => {
      finishResize(true);
    },
    [finishResize],
  );

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      disabled ||
      event.defaultPrevented ||
      event.button !== 0 ||
      isDefined(gestureRef.current)
    ) {
      return;
    }

    const requestedScale = isFunction(scale) ? scale() : scale;
    const resolvedScale =
      Number.isFinite(requestedScale) && requestedScale > 0
        ? requestedScale
        : 1;
    const ownerWindow = event.currentTarget.ownerDocument?.defaultView;

    const handleEscapeKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== 'Escape') {
        return;
      }

      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();
      finishResize(true);
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
    ownerWindow?.addEventListener('keydown', handleEscapeKeyDown, true);
    suppressActivationRef.current = false;
    gestureRef.current = {
      pointerId: event.pointerId,
      target: event.currentTarget,
      axis,
      startPosition: axis === 'y' ? event.clientY : event.clientX,
      startValue: value,
      currentValue: value,
      multiplier: (isReversed ? -1 : 1) / resolvedScale,
      threshold: Math.max(0, dragThreshold),
      hasStarted: false,
      removeEscapeKeyListener: () =>
        ownerWindow?.removeEventListener('keydown', handleEscapeKeyDown, true),
    };
  };

  const updateResize = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;

    if (
      event.defaultPrevented ||
      !isDefined(gesture) ||
      gesture.pointerId !== event.pointerId
    ) {
      return;
    }

    if (disabled) {
      finishResize(true);
      return;
    }

    const position = gesture.axis === 'y' ? event.clientY : event.clientX;
    const delta = position - gesture.startPosition;
    const crossedThreshold = Math.abs(delta) > gesture.threshold;

    if (!gesture.hasStarted && !crossedThreshold) {
      return;
    }

    const nextValue = clamp(
      gesture.startValue + delta * gesture.multiplier,
      min,
      max,
    );

    if (gesture.hasStarted && nextValue === gesture.currentValue) {
      return;
    }

    gesture.currentValue = nextValue;

    if (!gesture.hasStarted) {
      gesture.hasStarted = true;
      onResizeStart?.(nextValue);
    }

    onValueChange(nextValue);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (gestureRef.current?.pointerId !== event.pointerId) {
      return;
    }

    updateResize(event);
    finishResize(disabled || event.defaultPrevented);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (gestureRef.current?.pointerId === event.pointerId) {
      finishResize(true);
    }
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const isDragClick = suppressActivationRef.current && event.detail > 0;

    suppressActivationRef.current = false;

    if (disabled || event.defaultPrevented || isDragClick) {
      return;
    }

    onActivate?.();
  };

  return {
    onMouseDown: handleMouseDown,
    onPointerDown: handlePointerDown,
    onPointerMove: updateResize,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
    onLostPointerCapture: handlePointerCancel,
    onClick: handleClick,
    isPointerActive: () => isDefined(gestureRef.current),
  };
};
