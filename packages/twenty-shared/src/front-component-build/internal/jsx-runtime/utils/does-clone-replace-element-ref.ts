import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';

export const doesCloneReplaceElementRef = (
  cloneConfig: ElementProps,
  elementRef: UserRef,
) => {
  const cloneSetsRef = cloneConfig.ref !== undefined;
  const cloneRefDiffersFromElementRef = cloneConfig.ref !== elementRef;
  return cloneSetsRef && cloneRefDiffersFromElementRef;
};
