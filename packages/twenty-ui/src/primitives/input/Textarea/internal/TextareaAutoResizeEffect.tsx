import { type CSSProperties, useLayoutEffect, useRef } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type TextareaProps } from '../types/TextareaProps';
import { formatInlineBlockSize } from './formatInlineBlockSize';
import { observeTextareaWidth } from './observeTextareaWidth';
import { resizeTextareaToContent } from './resizeTextareaToContent';

type TextareaAutoResizeEffectProps = Pick<
  TextareaProps,
  'autoResize' | 'value' | 'maxRows' | 'rows' | 'size' | 'variant' | 'form'
> & {
  textarea: HTMLTextAreaElement | null;
  consumerBlockSize: CSSProperties['blockSize'];
};

export const TextareaAutoResizeEffect = ({
  textarea,
  autoResize,
  value,
  maxRows,
  rows,
  size,
  variant,
  consumerBlockSize,
  form,
}: TextareaAutoResizeEffectProps) => {
  const wasAutoResize = useRef(false);

  useLayoutEffect(() => {
    if (!isDefined(textarea)) {
      return;
    }

    const shouldRestoreBlockSize = wasAutoResize.current;
    wasAutoResize.current = autoResize ?? false;

    if (autoResize) {
      resizeTextareaToContent(textarea);
      return;
    }

    if (shouldRestoreBlockSize) {
      textarea.style.blockSize = formatInlineBlockSize(consumerBlockSize);
    }
  }, [
    textarea,
    autoResize,
    value,
    maxRows,
    rows,
    size,
    variant,
    consumerBlockSize,
  ]);

  useLayoutEffect(() => {
    if (!autoResize || !isDefined(textarea)) {
      return;
    }

    let isActive = true;
    const handleReset = (event: Event) => {
      requestAnimationFrame(() => {
        if (isActive && !event.defaultPrevented) {
          resizeTextareaToContent(textarea);
        }
      });
    };

    const textareaForm = textarea.form;
    const stopObservingWidth = observeTextareaWidth(textarea);

    textareaForm?.addEventListener('reset', handleReset);

    return () => {
      isActive = false;
      textareaForm?.removeEventListener('reset', handleReset);
      stopObservingWidth?.();
    };
  }, [textarea, autoResize, form]);

  return null;
};
