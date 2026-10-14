import { useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { hasMovedDropdownNode } from './hasMovedDropdownNode';
import { notifyDropdownRegistryListeners } from './notifyDropdownRegistryListeners';
import { useDropdownContext } from './useDropdownContext';

type DropdownRowOrderEffectProps = {
  content: HTMLDivElement | null;
};

export const DropdownRowOrderEffect = ({
  content,
}: DropdownRowOrderEffectProps) => {
  const { registry } = useDropdownContext();

  useLayoutEffect(() => {
    if (!isDefined(content)) {
      return;
    }

    const observer = new MutationObserver((records) => {
      if (hasMovedDropdownNode(records)) {
        notifyDropdownRegistryListeners(registry);
      }
    });

    observer.observe(content, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [content, registry]);

  return null;
};
