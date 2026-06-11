import { useAtomValue } from 'jotai';

import { Icon123 } from '@ui/display/icon/components/TablerIcons';
import { iconsState } from '@ui/display/icon/states/iconsState';

export const useIcons = () => {
  const icons = useAtomValue(iconsState);
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
