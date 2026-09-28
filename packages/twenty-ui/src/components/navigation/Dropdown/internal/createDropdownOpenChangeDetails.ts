import { type BaseUIGenericEventDetails } from '@base-ui/react/types';

import { type DropdownOpenChangeDetails } from '../types/DropdownOpenChangeDetails';

export const createDropdownOpenChangeDetails = (
  cause: BaseUIGenericEventDetails<DropdownOpenChangeDetails['reason']>,
): DropdownOpenChangeDetails => {
  let isCanceled = false;
  let isPropagationAllowed = false;

  return {
    ...cause,
    trigger: undefined,
    cancel: () => {
      isCanceled = true;
    },
    allowPropagation: () => {
      isPropagationAllowed = true;
    },
    get isCanceled() {
      return isCanceled;
    },
    get isPropagationAllowed() {
      return isPropagationAllowed;
    },
  };
};
