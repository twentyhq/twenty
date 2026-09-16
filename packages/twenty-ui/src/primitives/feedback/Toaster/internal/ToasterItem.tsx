import { useRef } from 'react';

import { Toast } from '@ui/primitives/feedback/Toast/Toast';
import { type ToastEntry } from '@ui/primitives/feedback/Toast/types/ToastEntry';

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
  const { notification, status } = toastEntry;
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
          <Toast
            {...toastProps}
            {...getToastProps?.(notification)}
            id={id}
            onClose={() => onClose(id)}
          />
        </div>
      </div>
      <ToasterItemExitEffect elementRef={elementRef} toastEntry={toastEntry} />
    </>
  );
};
