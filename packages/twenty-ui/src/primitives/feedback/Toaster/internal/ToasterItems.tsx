import { useAtomValue } from 'jotai';

import { useCloseToast } from '@ui/primitives/feedback/Toast/hooks/useCloseToast';
import { useCompleteToastExit } from '@ui/primitives/feedback/Toast/hooks/useCompleteToastExit';
import { useToastContext } from '@ui/primitives/feedback/Toast/hooks/useToastContext';
import { toastsState } from '@ui/primitives/feedback/Toast/states/toastsState';

import { type ToasterProps } from '../types/ToasterProps';
import { ToasterItem } from './ToasterItem';

type ToasterItemsProps = {
  getToastProps?: ToasterProps['getToastProps'];
};

export const ToasterItems = ({ getToastProps }: ToasterItemsProps) => {
  const store = useToastContext();
  const toasts = useAtomValue(toastsState, { store });
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
