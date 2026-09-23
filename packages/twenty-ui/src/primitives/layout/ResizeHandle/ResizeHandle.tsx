import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { clamp } from '@base-ui/utils/clamp';
import { useControlled } from '@base-ui/utils/useControlled';
import { clsx } from 'clsx';

import { RESIZE_HANDLE_DEFAULTS } from './internal/ResizeHandleDefaults';
import { useResizeHandleInteraction } from './internal/useResizeHandleInteraction';
import styles from './ResizeHandle.module.scss';
import { type ResizeHandleProps } from './types/ResizeHandleProps';

export const ResizeHandle = ({
  axis = 'y',
  value: controlledValue,
  defaultValue = RESIZE_HANDLE_DEFAULTS.value,
  onValueChange,
  min = RESIZE_HANDLE_DEFAULTS.min,
  max = RESIZE_HANDLE_DEFAULTS.max,
  step = RESIZE_HANDLE_DEFAULTS.step,
  disabled = false,
  className,
  children,
  render,
  ref,
  ...props
}: ResizeHandleProps) => {
  const [value, setValue] = useControlled({
    controlled: controlledValue,
    default: defaultValue,
    name: 'ResizeHandle',
  });
  const boundedValue = clamp(value, min, max);
  const handleValueChange = (nextValue: number) => {
    if (nextValue === boundedValue) {
      return;
    }

    setValue(nextValue);
    onValueChange?.(nextValue);
  };
  const interactionProps = useResizeHandleInteraction({
    axis,
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
    state: { axis, disabled },
    props: mergeProps<'div'>(interactionProps, props, {
      role: 'separator',
      tabIndex: disabled ? -1 : (props.tabIndex ?? 0),
      'aria-label': props['aria-label'] ?? 'Resize',
      'aria-orientation': axis === 'y' ? 'horizontal' : 'vertical',
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': boundedValue,
      'aria-disabled': disabled || undefined,
      className: clsx(styles.area, className),
      children: children ?? <div className={styles.bar} />,
    }),
  });
};
