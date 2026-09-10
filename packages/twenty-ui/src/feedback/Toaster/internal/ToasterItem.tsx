import { Toast } from '@ui/feedback/Toast/Toast';
import { type ToastEntry } from '@ui/feedback/Toast/internal/ToastEntry';
import { isDefined } from '@ui/utilities/utils/isDefined';

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

  return (
    <div
      ref={(element) => {
        if (!isDefined(element) || status === 'visible') {
          return;
        }

        const exitAnimations = element.getAnimations?.() ?? [];

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
      }}
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
