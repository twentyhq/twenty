import { type ToastNotification } from '@ui/feedback/Toast/types/ToastNotification';

import { ToasterItem } from './ToasterItem';
import { useToastPresence } from './useToastPresence';

type ToasterItemsProps = {
  toasts: ToastNotification[];
  onClose: (id: string) => void;
};

export const ToasterItems = ({ toasts, onClose }: ToasterItemsProps) => {
  const { renderedToasts, handleExitComplete } = useToastPresence(toasts);

  return renderedToasts.map((toast) => (
    <ToasterItem
      key={toast.id}
      toast={toast}
      isPresent={toasts.some((currentToast) => currentToast.id === toast.id)}
      onClose={onClose}
      onExitComplete={handleExitComplete}
    />
  ));
};
