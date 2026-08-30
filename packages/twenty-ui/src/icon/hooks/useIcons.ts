import { useCallback, useContext } from 'react';

import { Icon123 } from '@ui/icon/components/TablerIcons';
import { IconsContext } from '@ui/icon/internal/IconsContext';

const DEFAULT_ICON = Icon123;

// Stable across renders so callers can hold getIcon in a dependency array
// without invalidating whatever they memoize around it.
export const useIcons = () => {
  const icons = useContext(IconsContext);

  const getIcons = useCallback(() => icons, [icons]);

  const getIcon = useCallback(
    (iconKey?: string | null, customDefaultIcon?: string) =>
      icons[iconKey ?? ''] || icons[customDefaultIcon ?? ''] || DEFAULT_ICON,
    [icons],
  );

  return { getIcons, getIcon };
};
