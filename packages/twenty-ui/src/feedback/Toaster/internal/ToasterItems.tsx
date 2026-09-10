import { useSyncExternalStore } from 'react';

import { useToastContext } from '@ui/feedback/Toast/internal/useToastContext';

import { type ToasterProps } from '../types/ToasterProps';
import { ToasterItem } from './ToasterItem';

type ToasterItemsProps = {
  getToastProps?: ToasterProps['getToastProps'];
};

export const ToasterItems = ({ getToastProps }: ToasterItemsProps) => {
  const store = useToastContext();
  const toasts = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return toasts.map((toast) => (
    <ToasterItem
      key={toast.renderKey}
      toastEntry={toast}
      getToastProps={getToastProps}
      onClose={store.close}
      onExitComplete={store.completeExit}
    />
  ));
};
