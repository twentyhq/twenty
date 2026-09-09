import { useLayoutEffect, useRef } from 'react';

import { Toast } from '@ui/feedback/Toast/Toast';
import { type ToastEntry } from '@ui/feedback/Toast/internal/ToastEntry';

import styles from '../Toaster.module.scss';
import { type ToasterProps } from '../types/ToasterProps';

type ToasterItemProps = {
  toastEntry: ToastEntry;
  getToastProps?: ToasterProps['getToastProps'];
  onClose: (id: string) => void;
  onExitComplete: (toast: ToastEntry) => void;
};

export const ToasterItem = ({
  toastEntry,
  getToastProps,
  onClose,
  onExitComplete,
}: ToasterItemProps) => {
  const { notification, status } = toastEntry;
  const { id, dedupeKey: _dedupeKey, ...toastProps } = notification;
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (status === 'visible') {
      return;
    }

    let isCancelled = false;
    // The card's countdown must not delay removal when its wrapper finishes.
    const animations = ref.current?.getAnimations?.() ?? [];
    Promise.allSettled(animations.map((animation) => animation.finished)).then(
      () => {
        if (!isCancelled) {
          onExitComplete(toastEntry);
        }
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [toastEntry, status, onExitComplete]);

  return (
    <div
      ref={ref}
      className={styles.item}
      data-exiting={status === 'closing' || undefined}
      inert={status === 'closing'}
    >
      <div className={styles.itemContent}>
        <Toast
          {...toastProps}
          {...getToastProps?.(notification)}
          id={id}
          onClose={() => onClose(id)}
        />
      </div>
    </div>
  );
};
