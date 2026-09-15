import { Input as InputPrimitive } from '@base-ui/react/input';
import { clsx } from 'clsx';
import {
  type ChangeEvent,
  type CSSProperties,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { formatInlineBlockSize } from './internal/formatInlineBlockSize';
import { mergeRefs } from './internal/mergeRefs';
import { resizeTextareaToContent } from './internal/resizeTextareaToContent';
import styles from './Textarea.module.scss';
import { type TextareaProps } from './types/TextareaProps';

const TEXTAREA_RENDER_ELEMENT = <textarea />;

export const Textarea = ({
  size = 'md',
  autoResize = false,
  maxRows,
  className,
  style,
  ref,
  render = TEXTAREA_RENDER_ELEMENT,
  onChange,
  value,
  rows,
  ...props
}: TextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Base UI re-forks a merged ref whenever its identity changes, which would detach and reattach it on every render.
  const mergedRef = useMemo(() => mergeRefs(ref, textareaRef), [ref]);
  const isControlled = isDefined(value);
  const consumerBlockSize = style?.blockSize;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!isDefined(textarea)) {
      return;
    }

    if (!autoResize) {
      textarea.style.blockSize = formatInlineBlockSize(consumerBlockSize);
      return;
    }

    resizeTextareaToContent(textarea);
  }, [autoResize, value, maxRows, rows, consumerBlockSize]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    // A controlled parent may reject the edit, so the layout effect measures the committed value instead.
    if (autoResize && !isControlled) {
      resizeTextareaToContent(event.currentTarget);
    }

    onChange?.(event);
  };

  const resolvedStyle = isDefined(maxRows)
    ? ({ ...style, '--tw-textarea-max-rows': maxRows } as CSSProperties)
    : style;

  // Base UI types its control for <input> but only reads currentTarget.value, so rendering a textarea through it is safe.
  const primitiveProps = {
    ...props,
    rows,
    onChange: handleChange,
  } as unknown as InputPrimitive.Props;

  return (
    <InputPrimitive
      {...primitiveProps}
      ref={mergedRef}
      render={render}
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
