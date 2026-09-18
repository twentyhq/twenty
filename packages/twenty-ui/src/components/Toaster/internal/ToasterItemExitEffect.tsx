import { type RefObject, useLayoutEffect } from 'react';

import { useToastContext } from '@ui/components/Toast/hooks/useToastContext';
import { type ToastEntry } from '@ui/components/Toast/types/ToastEntry';
import { completeToastExit } from '@ui/components/Toast/utils/completeToastExit';

type ToasterItemExitEffectProps = {
  elementRef: RefObject<HTMLDivElement | null>;
  toastEntry: ToastEntry;
};

export const ToasterItemExitEffect = ({
  elementRef,
  toastEntry,
}: ToasterItemExitEffectProps) => {
  const store = useToastContext();

  useLayoutEffect(() => {
    if (toastEntry.status === 'visible') {
      return;
    }

    const exitAnimations = elementRef.current?.getAnimations?.() ?? [];

    if (exitAnimations.length === 0) {
      completeToastExit({ store, toast: toastEntry });
      return;
    }

    let isCancelled = false;
    Promise.allSettled(
      exitAnimations.map((animation) => animation.finished),
    ).then(() => {
      if (!isCancelled) {
        completeToastExit({ store, toast: toastEntry });
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [elementRef, toastEntry, store]);

  return <></>;
};
