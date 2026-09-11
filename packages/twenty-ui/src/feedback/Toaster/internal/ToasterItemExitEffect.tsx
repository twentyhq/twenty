import { type RefObject, useLayoutEffect } from 'react';

import { type ToastEntry } from '@ui/feedback/Toast/types/ToastEntry';

type ToasterItemExitEffectProps = {
  elementRef: RefObject<HTMLDivElement | null>;
  toastEntry: ToastEntry;
  onExitComplete: (toast: ToastEntry) => void;
};

export const ToasterItemExitEffect = ({
  elementRef,
  toastEntry,
  onExitComplete,
}: ToasterItemExitEffectProps) => {
  useLayoutEffect(() => {
    if (toastEntry.status === 'visible') {
      return;
    }

    const exitAnimations = elementRef.current?.getAnimations?.() ?? [];

    if (exitAnimations.length === 0) {
      onExitComplete(toastEntry);
      return;
    }

    let isCancelled = false;
    Promise.allSettled(
      exitAnimations.map((animation) => animation.finished),
    ).then(() => {
      if (!isCancelled) {
        onExitComplete(toastEntry);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [elementRef, toastEntry, onExitComplete]);

  return <></>;
};
