import { useAtomValue, useSetAtom } from 'jotai';

import {
  closeToastAtom,
  completeToastExitAtom,
  toastStateAtom,
} from '@ui/feedback/Toast/internal/toastAtoms';
import { useToastContext } from '@ui/feedback/Toast/internal/useToastContext';

import { type ToasterProps } from '../types/ToasterProps';
import { ToasterItem } from './ToasterItem';

type ToasterItemsProps = {
  getToastProps?: ToasterProps['getToastProps'];
};

export const ToasterItems = ({ getToastProps }: ToasterItemsProps) => {
  const store = useToastContext();
  const { toasts } = useAtomValue(toastStateAtom, { store });
  const close = useSetAtom(closeToastAtom, { store });
  const completeExit = useSetAtom(completeToastExitAtom, { store });

  return toasts.map((toast) => (
    <ToasterItem
      key={toast.renderKey}
      toastEntry={toast}
      getToastProps={getToastProps}
      onClose={close}
      onExitComplete={completeExit}
    />
  ));
};
