import { isFunction } from '@sniptt/guards';
import { type Ref, type RefCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const mergeRefs =
  <TElement>(...refs: (Ref<TElement> | undefined)[]): RefCallback<TElement> =>
  (node) => {
    for (const ref of refs) {
      if (!isDefined(ref)) {
        continue;
      }

      if (isFunction(ref)) {
        ref(node);
        continue;
      }

      ref.current = node;
    }
  };
