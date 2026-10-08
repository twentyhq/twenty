import { Input as InputPrimitive } from '@base-ui/react/input';
import { clsx } from 'clsx';
import {
  type ChangeEvent,
  type CSSProperties,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { TextareaControl } from './internal/TextareaControl';
import { formatInlineBlockSize } from './internal/formatInlineBlockSize';
import { mergeRefs } from './internal/mergeRefs';
import { observeTextareaWidth } from './internal/observeTextareaWidth';
import { resizeTextareaToContent } from './internal/resizeTextareaToContent';
import styles from './Textarea.module.scss';
import { type TextareaProps } from './types/TextareaProps';

export const Textarea = ({
  size = 'md',
  autoResize = false,
  maxRows,
  className,
  style,
  ref,
  render,
  onChange,
  value,
  rows,
  ...props
}: TextareaProps) => {
  const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null);
  const mergedRef = useMemo(() => mergeRefs(ref, setTextarea), [ref]);
  const isControlled = isDefined(value);
  const consumerBlockSize = style?.blockSize;
  const wasAutoResize = useRef(false);

  useLayoutEffect(() => {
    if (!isDefined(textarea)) {
      return;
    }

    const shouldRestoreBlockSize = wasAutoResize.current;
    wasAutoResize.current = autoResize;

    if (autoResize) {
      resizeTextareaToContent(textarea);
      return;
    }

    if (shouldRestoreBlockSize) {
      textarea.style.blockSize = formatInlineBlockSize(consumerBlockSize);
    }
  }, [textarea, autoResize, value, maxRows, rows, size, consumerBlockSize]);

  useLayoutEffect(() => {
    if (!autoResize || !isDefined(textarea)) {
      return;
    }

    let isActive = true;
    const handleReset = (event: Event) => {
      queueMicrotask(() => {
        if (isActive && !event.defaultPrevented) {
          resizeTextareaToContent(textarea);
        }
      });
    };

    const form = textarea.form;
    const stopObservingWidth = observeTextareaWidth(textarea);

    form?.addEventListener('reset', handleReset);

    return () => {
      isActive = false;
      form?.removeEventListener('reset', handleReset);
      stopObservingWidth?.();
    };
  }, [textarea, autoResize, props.form]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize && !isControlled) {
      resizeTextareaToContent(event.currentTarget);
    }

    onChange?.(event);
  };

  const resolvedStyle = isDefined(maxRows)
    ? ({ ...style, '--tw-textarea-max-rows': maxRows } as CSSProperties)
    : style;

  const {
    id,
    name,
    disabled,
    autoFocus,
    defaultValue,
    onValueChange,
    ...nativeProps
  } = props;

  const controlProps = {
    id,
    name,
    disabled,
    autoFocus,
    defaultValue,
    onValueChange,
  };

  return (
    <InputPrimitive
      {...controlProps}
      render={(elementProps, state) => (
        <TextareaControl
          controlProps={elementProps}
          nativeProps={{
            ...nativeProps,
            rows,
            onChange: handleChange,
            ref: mergedRef,
          }}
          state={state}
          render={render}
        />
      )}
      value={value}
      className={mergeClassNames(
        clsx(styles.textarea, styles[size]),
        className,
      )}
      style={resolvedStyle}
      data-auto-resize={autoResize || undefined}
    />
  );
};
