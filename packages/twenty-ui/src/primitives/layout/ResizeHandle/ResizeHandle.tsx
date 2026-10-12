import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { clamp } from '@base-ui/utils/clamp';
import { useControlled } from '@base-ui/utils/useControlled';
import { clsx } from 'clsx';
import { useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { RESIZE_HANDLE_DEFAULTS } from './internal/ResizeHandleDefaults.constant';
import { RESIZE_HANDLE_EDGES } from './internal/ResizeHandleEdges.constant';
import { useResizeHandleInteraction } from './internal/useResizeHandleInteraction';
import styles from './ResizeHandle.module.scss';
import { type ResizeHandleProps } from './types/ResizeHandleProps';

export const ResizeHandle = ({
  axis: requestedAxis = 'y',
  direction,
  edge,
  placement = isDefined(edge) ? 'edge' : 'inline',
  scale = 1,
  dragThreshold = isDefined(edge)
    ? RESIZE_HANDLE_DEFAULTS.edgeDragThreshold
    : RESIZE_HANDLE_DEFAULTS.dragThreshold,
  value: controlledValue,
  defaultValue = RESIZE_HANDLE_DEFAULTS.value,
  onValueChange,
  onValueCommitted,
  onResizeStart,
  onResizeEnd,
  onActivate,
  min = RESIZE_HANDLE_DEFAULTS.min,
  max = RESIZE_HANDLE_DEFAULTS.max,
  step = RESIZE_HANDLE_DEFAULTS.step,
  disabled = false,
  className,
  children = placement === 'gap' ? null : <div className={styles.bar} />,
  render,
  ref,
  ...props
}: ResizeHandleProps) => {
  const edgeConfiguration = isDefined(edge)
    ? RESIZE_HANDLE_EDGES[edge]
    : undefined;
  const axis = edgeConfiguration?.axis ?? requestedAxis;
  const resolvedDirection = edgeConfiguration?.direction ?? direction;
  const [isResizing, setIsResizing] = useState(false);
  const [value, setValue] = useControlled({
    controlled: controlledValue,
    default: defaultValue,
    name: 'ResizeHandle',
  });
  const boundedValue = clamp(value, min, max);
  const handleValueChange = (nextValue: number) => {
    setValue(nextValue);
    onValueChange?.(nextValue);
  };
  const handleResizeStart = (nextValue: number) => {
    setIsResizing(true);
    onResizeStart?.(nextValue);
  };
  const handleResizeEnd = (details: { cancelled: boolean; value: number }) => {
    setIsResizing(false);
    onResizeEnd?.(details);
  };
  const interactionProps = useResizeHandleInteraction({
    axis,
    direction: resolvedDirection,
    scale,
    dragThreshold,
    onValueCommitted,
    onResizeStart: handleResizeStart,
    onResizeEnd: handleResizeEnd,
    onActivate,
    value: boundedValue,
    onValueChange: handleValueChange,
    min,
    max,
    step,
    disabled,
  });

  return useRender({
    render,
    ref,
    state: { axis, edge, placement, disabled, resizing: isResizing },
    props: mergeProps<'div'>(interactionProps, props, {
      role: 'separator',
      tabIndex: disabled ? -1 : (props.tabIndex ?? 0),
      'aria-label': props['aria-label'] ?? 'Resize',
      'aria-orientation': axis === 'y' ? 'horizontal' : 'vertical',
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': boundedValue,
      'aria-disabled': disabled || undefined,
      'aria-keyshortcuts':
        props['aria-keyshortcuts'] ??
        (isDefined(onActivate) && !disabled ? 'Enter Space' : undefined),
      className: clsx(styles.area, className),
      children,
    }),
  });
};
