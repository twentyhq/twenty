import { useContext } from 'react';

import { Icon123 } from '@ui/icon/components/TablerIcons';
import { IconsContext } from '@ui/icon/internal/IconsContext';

export const useIcons = () => {
  const icons = useContext(IconsContext);
  const defaultIcon = Icon123;

  const getIcons = () => {
    return icons;
  };

  const getIcon = (iconKey?: string | null, customDefaultIcon?: string) => {
    return (
      icons[iconKey ?? ''] || icons[customDefaultIcon ?? ''] || defaultIcon
    );
  };

  return { getIcons, getIcon };
};
