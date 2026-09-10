import { type RefObject, useLayoutEffect } from 'react';

import { type ToastEntry } from '@ui/feedback/Toast/internal/ToastEntry';

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
  const { status } = toastEntry;

  useLayoutEffect(() => {
    if (status === 'visible') {
      return;
    }

    let isCancelled = false;
    const wrapperOwnAnimationsWithoutCardCountdown =
      elementRef.current?.getAnimations?.() ?? [];
    Promise.allSettled(
      wrapperOwnAnimationsWithoutCardCountdown.map(
        (animation) => animation.finished,
      ),
    ).then(() => {
      if (!isCancelled) {
        onExitComplete(toastEntry);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [elementRef, toastEntry, status, onExitComplete]);

  return <></>;
};
