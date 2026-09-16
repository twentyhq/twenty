import { useCloseToast } from '@ui/primitives/feedback/Toast/hooks/useCloseToast';
import { useToastEntries } from '@ui/primitives/feedback/Toast/hooks/useToastEntries';

import { type ToasterProps } from '../types/ToasterProps';
import { ToasterItem } from './ToasterItem';

type ToasterItemsProps = {
  getToastProps?: ToasterProps['getToastProps'];
};

export const ToasterItems = ({ getToastProps }: ToasterItemsProps) => {
  const toasts = useToastEntries();
  const { closeToast } = useCloseToast();

  return toasts.map((toast) => (
    <ToasterItem
      key={toast.notification.id}
      toastEntry={toast}
      getToastProps={getToastProps}
      onClose={closeToast}
    />
  ));
};
