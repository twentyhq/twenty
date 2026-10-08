import { isDefined } from '@ui/utilities/utils/isDefined';

import { resizeTextareaToContent } from './resizeTextareaToContent';

export const observeTextareaWidth = (textarea: HTMLTextAreaElement) => {
  if (!isDefined(globalThis.ResizeObserver)) {
    return undefined;
  }

  let animationFrame: number | undefined;
  let previousWidth = textarea.clientWidth;
  const observer = new ResizeObserver(() => {
    const width = textarea.clientWidth;

    if (width === previousWidth) {
      return;
    }

    previousWidth = width;
    if (isDefined(animationFrame)) {
      cancelAnimationFrame(animationFrame);
    }

    animationFrame = requestAnimationFrame(() => {
      animationFrame = undefined;
      resizeTextareaToContent(textarea);
    });
  });

  observer.observe(textarea);

  return () => {
    observer.disconnect();

    if (isDefined(animationFrame)) {
      cancelAnimationFrame(animationFrame);
    }
  };
};
