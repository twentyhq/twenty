import { useLayoutEffect, useRef } from 'react';

import { Toast } from '@ui/feedback/Toast/Toast';
import { type ToastNotification } from '@ui/feedback/Toast/types/ToastNotification';

import styles from '../Toaster.module.scss';
import { type ToasterProps } from '../types/ToasterProps';

type ToasterItemProps = {
  toast: ToastNotification;
  getToastProps?: ToasterProps['getToastProps'];
  isPresent: boolean;
  onClose: (id: string) => void;
  onExitComplete: (id: string) => void;
};

export const ToasterItem = ({
  toast,
  getToastProps,
  isPresent,
  onClose,
  onExitComplete,
}: ToasterItemProps) => {
  const { id, dedupeKey: _dedupeKey, ...toastProps } = toast;
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isPresent) {
      return;
    }

    let isCancelled = false;
    // The card's countdown must not delay removal when its wrapper finishes.
    const animations = ref.current?.getAnimations?.() ?? [];
    Promise.allSettled(animations.map((animation) => animation.finished)).then(
      () => {
        if (!isCancelled) {
          onExitComplete(id);
        }
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [id, isPresent, onExitComplete]);

  return (
    <div
      ref={ref}
      className={styles.item}
      data-exiting={!isPresent || undefined}
      inert={!isPresent}
    >
      <div className={styles.itemContent}>
        <Toast
          {...toastProps}
          {...getToastProps?.(toast)}
          id={id}
          onClose={() => onClose(id)}
        />
      </div>
    </div>
  );
};
