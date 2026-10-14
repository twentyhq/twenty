import { useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { hasMovedDropdownNode } from './hasMovedDropdownNode';
import { notifyDropdownRowRegistryListeners } from './notifyDropdownRowRegistryListeners';
import { useDropdownContext } from './useDropdownContext';

type DropdownRowOrderEffectProps = {
  content: HTMLDivElement | null;
};

export const DropdownRowOrderEffect = ({
  content,
}: DropdownRowOrderEffectProps) => {
  const { rowRegistry } = useDropdownContext();

  useLayoutEffect(() => {
    if (!isDefined(content)) {
      return;
    }

    const observer = new MutationObserver((records) => {
      if (hasMovedDropdownNode(records)) {
        notifyDropdownRowRegistryListeners(rowRegistry);
      }
    });

    observer.observe(content, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [content, rowRegistry]);

  return null;
};
