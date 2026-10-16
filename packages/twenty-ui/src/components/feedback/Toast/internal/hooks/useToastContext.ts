import { useContext } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { ToastContext } from '../contexts/ToastContext';

export const useToastContext = () => {
  const context = useContext(ToastContext);

  if (!isDefined(context)) {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is an internal provider invariant for developers.
    throw new Error('Toast components must be used within a ToastProvider.');
  }

  return context;
};
