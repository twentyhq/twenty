import { useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownFocusTarget } from './getDropdownFocusTarget';
import { useDropdownContext } from './useDropdownContext';

export const DropdownPageFocusEffect = () => {
  const {
    open,
    type,
    pageId,
    registry,
    contentRef,
    pageFocusRequest,
    setPageFocusRequest,
  } = useDropdownContext();

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
      registry,
      pageId,
      type,
      target: pageFocusRequest.target,
    }).focus();
  }, [
    contentRef,
    open,
    pageId,
    pageFocusRequest,
    registry,
    setPageFocusRequest,
    type,
  ]);

  return null;
};
