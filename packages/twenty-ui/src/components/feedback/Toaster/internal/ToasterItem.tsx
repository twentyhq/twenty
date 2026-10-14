import { useRef } from 'react';

import { Toast } from '@ui/components/feedback/Toast/Toast';
import { ToastTimingContext } from '@ui/components/feedback/Toast/internal/contexts/ToastTimingContext';
import { type ToastEntry } from '@ui/components/feedback/Toast/internal/types/ToastEntry';

import styles from '../Toaster.module.scss';
import { type ToasterProps } from '../types/ToasterProps';
import { ToasterItemExitEffect } from './ToasterItemExitEffect';

type ToasterItemProps = {
  toastEntry: ToastEntry;
  getToastProps?: ToasterProps['getToastProps'];
  onClose: (id: string) => void;
};

export const ToasterItem = ({
  toastEntry,
  getToastProps,
  onClose,
}: ToasterItemProps) => {
  const { notification, status, durationRevision = 0 } = toastEntry;
  const { id, ...toastProps } = notification;
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={elementRef}
        className={styles.item}
        data-exiting={status === 'closing' || undefined}
        inert={status === 'closing'}
      >
        <div className={styles.itemContent}>
          <ToastTimingContext.Provider
            value={{ durationRevision, isActive: status === 'visible' }}
          >
            <Toast
              {...toastProps}
              {...getToastProps?.(notification)}
              id={id}
              onClose={() => onClose(id)}
            />
          </ToastTimingContext.Provider>
        </div>
      </div>
      <ToasterItemExitEffect elementRef={elementRef} toastEntry={toastEntry} />
    </>
  );
};
