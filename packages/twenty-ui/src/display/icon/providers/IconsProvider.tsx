import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { iconsState } from '@ui/display/icon/states/iconsState';

type IconsProviderProps = {
  children: JSX.Element;
};

export const IconsProvider = ({ children }: IconsProviderProps) => {
  const setIcons = useSetRecoilState(iconsState);

  useEffect(() => {
    import('./internal/AllIcons').then(({ ALL_ICONS }) => {
      setIcons(ALL_ICONS);
    });
  }, [setIcons]);

  return children;
};
