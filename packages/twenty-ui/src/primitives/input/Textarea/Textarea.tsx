import { Input as InputPrimitive } from '@base-ui/react/input';
import { clsx } from 'clsx';
import { type ChangeEvent, type CSSProperties, useMemo, useState } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { TextareaControl } from './internal/TextareaControl';
import { TextareaAutoResizeEffect } from './internal/TextareaAutoResizeEffect';
import { mergeRefs } from './internal/mergeRefs';
import { resizeTextareaToContent } from './internal/resizeTextareaToContent';
import styles from './Textarea.module.scss';
import { type TextareaProps } from './types/TextareaProps';

export const Textarea = ({
  size = 'md',
  variant = 'default',
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
    'aria-describedby': ariaDescribedBy,
    id,
    name,
    disabled,
    autoFocus,
    defaultValue,
    onValueChange,
    ...nativeProps
  } = props;

  const controlProps = {
    'aria-describedby': ariaDescribedBy,
    id,
    name,
    disabled,
    autoFocus,
    defaultValue,
    onValueChange,
  };

  return (
    <>
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
        data-variant={variant}
      />
      <TextareaAutoResizeEffect
        textarea={textarea}
        autoResize={autoResize}
        value={value}
        maxRows={maxRows}
        rows={rows}
        size={size}
        variant={variant}
        consumerBlockSize={consumerBlockSize}
        form={props.form}
      />
    </>
  );
};
