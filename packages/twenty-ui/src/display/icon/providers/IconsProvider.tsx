import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { iconsState } from '@ui/display/icon/states/iconsState';

type IconsProviderProps = {
  children: JSX.Element;
};

export const IconsProvider = ({ children }: IconsProviderProps) => {
  const setIcons = useSetRecoilState(iconsState);

  throw Error('yo');

  useEffect(() => {
    import('./internal/AllIcons').then((lazyLoadedIcons) => {
      setIcons(lazyLoadedIcons.ALL_ICONS);
    });
  }, [setIcons]);

  return children;
};
