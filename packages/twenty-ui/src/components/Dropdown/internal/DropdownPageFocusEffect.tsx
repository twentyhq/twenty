import { type RefObject, useLayoutEffect, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownFocusTarget } from './getDropdownFocusTarget';
import { useDropdownContext } from './useDropdownContext';

type DropdownPageFocusEffectProps = {
  contentRef: RefObject<HTMLDivElement | null>;
};

export const DropdownPageFocusEffect = ({
  contentRef,
}: DropdownPageFocusEffectProps) => {
  const { pageId, open, focusTarget, type } = useDropdownContext();
  const [previousPageId, setPreviousPageId] = useState(pageId);

  useLayoutEffect(() => {
    if (previousPageId === pageId) {
      return;
    }

    setPreviousPageId(pageId);

    if (!open || !isDefined(contentRef.current)) {
      return;
    }

    getDropdownFocusTarget({
      content: contentRef.current,
      target: focusTarget,
      type,
    }).focus();
  }, [contentRef, focusTarget, open, pageId, previousPageId, type]);

  return null;
};
