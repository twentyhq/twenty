import { useRecoilValue } from 'recoil';

import { iconsState } from '../states/iconsState';
import { Icon123 } from '..';

export const useIcons = () => {
  const icons = useRecoilValue(iconsState());
  const defaultIcon = Icon123;

  const getIcons = () => {
    return icons;
  };

  const getIcon = (iconKey?: string | null) => {
    if (!iconKey) return defaultIcon;
    return icons[iconKey] ?? defaultIcon;
  };

  return { getIcons, getIcon };
};
