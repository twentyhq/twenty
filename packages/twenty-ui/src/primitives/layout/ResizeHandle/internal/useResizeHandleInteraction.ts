import { useDirection } from '@base-ui/react/direction-provider';
import { clamp } from '@base-ui/utils/clamp';
import { type KeyboardEvent } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ResizeHandleProps } from '../types/ResizeHandleProps';

import { useResizeHandlePointerInteraction } from './useResizeHandlePointerInteraction';

type UseResizeHandleInteractionArgs = Required<
  Pick<
    ResizeHandleProps,
    'axis' | 'value' | 'min' | 'max' | 'step' | 'disabled'
  >
> &
  Pick<
    ResizeHandleProps,
    | 'direction'
    | 'onValueCommitted'
    | 'onResizeStart'
    | 'onResizeEnd'
    | 'onActivate'
  > & {
    onValueChange: (value: number) => void;
    scale: number | (() => number);
    dragThreshold: number;
  };

export const useResizeHandleInteraction = ({
  axis,
  direction,
  value,
  onValueChange,
  onValueCommitted,
  onResizeStart,
  onResizeEnd,
  onActivate,
  scale,
  dragThreshold,
  min,
  max,
  step,
  disabled,
}: UseResizeHandleInteractionArgs) => {
  const textDirection = useDirection();
  const isReversed = isDefined(direction)
    ? direction === 'reverse'
    : axis === 'x' && textDirection === 'rtl';
  const { isPointerActive, ...pointerInteractionProps } =
    useResizeHandlePointerInteraction({
      axis,
      isReversed,
      value,
      onValueChange,
      onValueCommitted,
      onResizeStart,
      onResizeEnd,
      onActivate,
      scale,
      dragThreshold,
      min,
      max,
      disabled,
    });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const hasModifierKey = event.altKey || event.ctrlKey || event.metaKey;

    if (
      event.defaultPrevented ||
      disabled ||
      hasModifierKey ||
      isPointerActive()
    ) {
      return;
    }

    const isActivationKey = event.key === 'Enter' || event.key === ' ';

    if (isActivationKey && isDefined(onActivate)) {
      event.preventDefault();
      event.stopPropagation();

      if (!event.repeat) {
        onActivate();
      }

      return;
    }

    const forwardKey = axis === 'y' ? 'ArrowDown' : 'ArrowRight';
    const backwardKey = axis === 'y' ? 'ArrowUp' : 'ArrowLeft';
    const increaseKey = isReversed ? backwardKey : forwardKey;
    const decreaseKey = isReversed ? forwardKey : backwardKey;
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

    const boundedValue = clamp(nextValue, min, max);

    if (boundedValue === value) {
      return;
    }

    onValueChange(boundedValue);
    onValueCommitted?.(boundedValue);
  };

  return { ...pointerInteractionProps, onKeyDown: handleKeyDown };
};
