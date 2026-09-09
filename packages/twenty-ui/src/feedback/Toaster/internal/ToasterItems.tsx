import { type ToastNotification } from '@ui/feedback/Toast/types/ToastNotification';

import { type ToasterProps } from '../types/ToasterProps';
import { ToasterItem } from './ToasterItem';
import { useToastPresence } from './useToastPresence';

type ToasterItemsProps = {
  toasts: ToastNotification[];
  getToastProps?: ToasterProps['getToastProps'];
  onClose: (id: string) => void;
};

export const ToasterItems = ({
  toasts,
  getToastProps,
  onClose,
}: ToasterItemsProps) => {
  const { renderedToasts, handleExitComplete } = useToastPresence(toasts);

  return renderedToasts.map((toast) => (
    <ToasterItem
      key={toast.id}
      toast={toast}
      getToastProps={getToastProps}
      isPresent={toasts.some((currentToast) => currentToast.id === toast.id)}
      onClose={onClose}
      onExitComplete={handleExitComplete}
    />
  ));
};
