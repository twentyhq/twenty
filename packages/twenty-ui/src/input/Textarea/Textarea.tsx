import { Input as InputPrimitive } from '@base-ui/react/input';
import { clsx } from 'clsx';
import {
  type ChangeEvent,
  type CSSProperties,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

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
  ...props
}: TextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Base UI re-forks a merged ref whenever its identity changes, which would detach and reattach it on every render.
  const mergedRef = useMemo(() => mergeRefs(ref, textareaRef), [ref]);

  useLayoutEffect(() => {
    if (!autoResize || !isDefined(textareaRef.current)) {
      return;
    }

    resizeTextareaToContent(textareaRef.current);
  }, [autoResize, value, maxRows]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
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
    onChange: handleChange,
  } as unknown as InputPrimitive.Props;

  return (
    <InputPrimitive
      {...primitiveProps}
      ref={mergedRef}
      render={render}
      value={value}
      className={clsx(styles.textarea, styles[size], className)}
      style={resolvedStyle}
      data-auto-resize={autoResize || undefined}
    />
  );
};
