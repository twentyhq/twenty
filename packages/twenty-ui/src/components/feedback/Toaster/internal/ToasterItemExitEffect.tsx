import { isNonEmptyArray } from '@sniptt/guards';
import { type RefObject, useLayoutEffect } from 'react';

import { useToastContext } from '@ui/components/feedback/Toast/internal/hooks/useToastContext';
import { type ToastEntry } from '@ui/components/feedback/Toast/internal/types/ToastEntry';

type ToasterItemExitEffectProps = {
  elementRef: RefObject<HTMLDivElement | null>;
  toastEntry: ToastEntry;
  rendererKey: symbol;
};

export const ToasterItemExitEffect = ({
  elementRef,
  toastEntry,
  rendererKey,
}: ToasterItemExitEffectProps) => {
  const store = useToastContext();

  useLayoutEffect(() => {
    if (toastEntry.status === 'visible') {
      return;
    }

    const finishExit = () =>
      store.lifecycle.finishExit({
        id: toastEntry.notification.id,
        key: rendererKey,
      });
    const exitAnimations = elementRef.current?.getAnimations?.() ?? [];

    if (!isNonEmptyArray(exitAnimations)) {
      finishExit();
      return;
    }

    let isCancelled = false;
    Promise.allSettled(
      exitAnimations.map((animation) => animation.finished),
    ).then(() => {
      if (!isCancelled) {
        finishExit();
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [elementRef, toastEntry, store, rendererKey]);

  return null;
};
