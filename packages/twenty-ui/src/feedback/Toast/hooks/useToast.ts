import { useSetAtom } from 'jotai';
import { useMemo } from 'react';

import { closeToastAtom, enqueueToastAtom } from '../internal/toastAtoms';
import { useToastContext } from '../internal/useToastContext';
import { type ToastOptions } from '../types/ToastOptions';

export const useToast = () => {
  const store = useToastContext();
  const close = useSetAtom(closeToastAtom, { store });

  return useMemo(() => {
    function enqueueToast(options: ToastOptions): string;
    function enqueueToast(
      options: ToastOptions | undefined,
    ): string | undefined;
    function enqueueToast(options: ToastOptions | undefined) {
      return store.set(enqueueToastAtom, options);
    }

    return { enqueueToast, close };
  }, [store, close]);
};
