import { useContext } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { ToastContext } from '../contexts/ToastContext';

export const useToastContext = () => {
  const context = useContext(ToastContext);

  if (!isDefined(context)) {
    throw new Error('Toast components must be used within a ToastProvider.');
  }

  return context;
};
