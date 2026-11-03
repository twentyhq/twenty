import { useCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

type UsePreventPageZoomRefParams = {
  preventPageZoom: boolean;
  onElementChange?: (element: HTMLElement | null) => void;
};

export const usePreventPageZoomRef = ({
  preventPageZoom,
  onElementChange,
}: UsePreventPageZoomRefParams) =>
  useCallback(
    (element: HTMLElement | null) => {
      onElementChange?.(element);

      if (!isDefined(element)) {
        return;
      }

      const handleWheel = (event: WheelEvent) => {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
        }
      };

      if (preventPageZoom) {
        element.addEventListener('wheel', handleWheel, {
          capture: true,
          passive: false,
        });
      }

      return () => {
        element.removeEventListener('wheel', handleWheel, true);
        onElementChange?.(null);
      };
    },
    [preventPageZoom, onElementChange],
  );
