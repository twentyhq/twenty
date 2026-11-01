import { useRef, useState } from 'react';

import { Toast } from '@ui/components/feedback/Toast/Toast';
import { useToastContext } from '@ui/components/feedback/Toast/internal/hooks/useToastContext';
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
  const store = useToastContext();
  const customToastProps = getToastProps?.(notification);
  const [rendererKey] = useState(() => Symbol());
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
            value={{
              durationRevision,
              isActive: status === 'visible',
              lifecycle: store.lifecycle,
              id,
              rendererKey,
              timingOverrides: customToastProps,
            }}
          >
            <Toast
              {...toastProps}
              {...customToastProps}
              id={id}
              onClose={() => onClose(id)}
            />
          </ToastTimingContext.Provider>
        </div>
      </div>
      <ToasterItemExitEffect
        elementRef={elementRef}
        toastEntry={toastEntry}
        rendererKey={rendererKey}
      />
    </>
  );
};
