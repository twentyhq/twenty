import { iconsState } from '@ui/display/icon/states/iconsState';
import { useRecoilValue } from 'recoil';
import { Icon123 } from '../components/TablerIcons';

export const useIcons = () => {
  const icons = useRecoilValue(iconsState);
  const defaultIcon = Icon123;

  const getIcons = () => {
    return icons;
  };

  const getIcon = (iconKey?: string | null) => {
    if (!iconKey) {
      return defaultIcon;
    }

    return icons[iconKey] ?? defaultIcon;
  };

  return { getIcons, getIcon };
};
