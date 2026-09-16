import { useCloseToast } from '@ui/primitives/feedback/Toast/hooks/useCloseToast';
import { useCompleteToastExit } from '@ui/primitives/feedback/Toast/hooks/useCompleteToastExit';
import { useToastEntries } from '@ui/primitives/feedback/Toast/hooks/useToastEntries';

import { type ToasterProps } from '../types/ToasterProps';
import { ToasterItem } from './ToasterItem';

type ToasterItemsProps = {
  getToastProps?: ToasterProps['getToastProps'];
};

export const ToasterItems = ({ getToastProps }: ToasterItemsProps) => {
  const toasts = useToastEntries();
  const { closeToast } = useCloseToast();
  const { completeToastExit } = useCompleteToastExit();

  return toasts.map((toast) => (
    <ToasterItem
      key={toast.notification.id}
      toastEntry={toast}
      getToastProps={getToastProps}
      onClose={closeToast}
      onExitComplete={completeToastExit}
    />
  ));
};
