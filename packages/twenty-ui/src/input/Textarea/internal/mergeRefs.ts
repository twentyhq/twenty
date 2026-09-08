import { isFunction } from '@sniptt/guards';
import { type Ref, type RefCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

const assignRef = <TElement>(
  ref: Ref<TElement> | undefined,
  node: TElement | null,
) => {
  if (!isDefined(ref)) {
    return undefined;
  }

  if (isFunction(ref)) {
    return ref(node);
  }

  ref.current = node;

  return undefined;
};

export const mergeRefs =
  <TElement>(...refs: (Ref<TElement> | undefined)[]): RefCallback<TElement> =>
  (node) => {
    const cleanups = refs.map((ref) => {
      const cleanup = assignRef(ref, node);

      return isFunction(cleanup) ? cleanup : () => assignRef(ref, null);
    });

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  };
