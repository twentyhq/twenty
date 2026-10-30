import { useContext } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { ToastContext } from '../contexts/ToastContext';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

export const useToastContext = () => {
  const context = useContext(ToastContext);

  if (!isDefined(context)) {
    throw new Error(
      doNotTranslate('Toast components must be used within a ToastProvider.'),
    );
  }

  return context;
};
