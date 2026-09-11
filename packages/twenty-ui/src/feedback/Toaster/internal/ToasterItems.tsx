import { useAtomValue } from 'jotai';

import { useCloseToast } from '@ui/feedback/Toast/hooks/useCloseToast';
import { useCompleteToastExit } from '@ui/feedback/Toast/hooks/useCompleteToastExit';
import { useToastContext } from '@ui/feedback/Toast/hooks/useToastContext';
import { toastState } from '@ui/feedback/Toast/states/toastState';

import { type ToasterProps } from '../types/ToasterProps';
import { ToasterItem } from './ToasterItem';

type ToasterItemsProps = {
  getToastProps?: ToasterProps['getToastProps'];
};

export const ToasterItems = ({ getToastProps }: ToasterItemsProps) => {
  const store = useToastContext();
  const { toasts } = useAtomValue(toastState, { store });
  const { closeToast } = useCloseToast();
  const { completeToastExit } = useCompleteToastExit();

  return toasts.map((toast) => (
    <ToasterItem
      key={toast.renderKey}
      toastEntry={toast}
      getToastProps={getToastProps}
      onClose={closeToast}
      onExitComplete={completeToastExit}
    />
  ));
};
