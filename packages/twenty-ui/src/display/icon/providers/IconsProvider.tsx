import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { iconsState } from '@ui/display/icon/states/iconsState';

type IconsProviderProps = {
  children: JSX.Element;
};

export const IconsProvider = ({ children }: IconsProviderProps) => {
  const setIcons = useSetAtom(iconsState);

  useEffect(() => {
    import('./internal/AllIcons')
      .then(({ ALL_ICONS }) => {
        setIcons(ALL_ICONS);
      })
      .catch((error) => {
        if (
          error instanceof Error &&
          error.message.includes(
            'Failed to fetch dynamically imported module',
          )
        ) {
          window.location.reload();
        }
      });
  }, [setIcons]);

  return children;
};
