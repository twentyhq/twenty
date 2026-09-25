import { useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownSearchTarget } from './getDropdownSearchTarget';
import { useDropdownContext } from './useDropdownContext';

type DropdownSearchTargetEffectProps = {
  content: HTMLDivElement | null;
};

export const DropdownSearchTargetEffect = ({
  content,
}: DropdownSearchTargetEffectProps) => {
  const { setSearchTargetId } = useDropdownContext();

  useLayoutEffect(() => {
    if (!isDefined(content)) {
      return;
    }

    const updateSearchTarget = () =>
      setSearchTargetId(getDropdownSearchTarget(content)?.id);

    updateSearchTarget();

    const observer = new MutationObserver(updateSearchTarget);

    observer.observe(content, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled'],
    });
    content.addEventListener('input', updateSearchTarget);

    return () => {
      observer.disconnect();
      content.removeEventListener('input', updateSearchTarget);
      setSearchTargetId(undefined);
    };
  }, [content, setSearchTargetId]);

  return null;
};
