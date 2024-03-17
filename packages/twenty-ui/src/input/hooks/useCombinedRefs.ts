import React, { Ref, RefCallback } from 'react';
import { isFunction } from '@sniptt/guards';

export const useCombinedRefs =
  <T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> =>
  (node: T) => {
    for (const ref of refs) {
      if (isFunction(ref)) {
        ref(node);
      } else if (ref !== null && ref !== undefined) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
