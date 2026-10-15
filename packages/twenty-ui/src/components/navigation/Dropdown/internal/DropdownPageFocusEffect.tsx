import { type RefObject, useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownFocusTarget } from './getDropdownFocusTarget';
import { useDropdownContext } from './useDropdownContext';

type DropdownPageFocusEffectProps = {
  contentRef: RefObject<HTMLDivElement | null>;
};

export const DropdownPageFocusEffect = ({
  contentRef,
}: DropdownPageFocusEffectProps) => {
  const { open, pageId, pageFocusRequest, setPageFocusRequest } =
    useDropdownContext();

  useLayoutEffect(() => {
    if (!isDefined(pageFocusRequest)) {
      return;
    }

    setPageFocusRequest(undefined);

    if (
      !open ||
      pageFocusRequest.pageId !== pageId ||
      !isDefined(contentRef.current)
    ) {
      return;
    }

    getDropdownFocusTarget({
      content: contentRef.current,
      target: pageFocusRequest.target,
    }).focus();
  }, [contentRef, open, pageId, pageFocusRequest, setPageFocusRequest]);

  return null;
};
