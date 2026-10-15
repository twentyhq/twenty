import { useCallback, useRef, useState } from 'react';

import { type OverflowingListLayout } from './types/OverflowingListLayout';

export const useOverflowingListLayout = ({
  itemCount,
  inlineItemCount,
}: {
  itemCount: number;
  inlineItemCount: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const [layout, setLayout] = useState<OverflowingListLayout>({
    visibleItemCount: inlineItemCount,
    hasOverflow: itemCount > inlineItemCount,
  });
  const updateLayout = useCallback((nextLayout: OverflowingListLayout) => {
    setLayout((currentLayout) => {
      const hasChanged =
        currentLayout.visibleItemCount !== nextLayout.visibleItemCount ||
        currentLayout.hasOverflow !== nextLayout.hasOverflow;

      return hasChanged ? nextLayout : currentLayout;
    });
  }, []);

  return { containerRef, itemsRef, triggerRef, updateLayout, ...layout };
};
