import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import {
  Icon123,
  IconBuildingSkyscraper,
  IconUser,
} from '@ui/icon/components/TablerIcons';
import { IconsContext } from '@ui/icon/internal/IconsContext';
import { useIcons } from '@ui/icon/hooks/useIcons';

const mockedStateIcons = {
  IconUser,
  Icon123,
  IconBuildingSkyscraper,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <IconsContext.Provider value={mockedStateIcons}>
    {children}
  </IconsContext.Provider>
);

describe('useIcons', () => {
  const { result } = renderHook(() => useIcons(), {
    wrapper: Wrapper,
  });

  it('returns default icon when no icon key is provided', () => {
    expect(result.current.getIcon()).toEqual(Icon123);
  });

  it('returns the specified icon if the icon key exists in the iconsState', () => {
    expect(result.current.getIcon('Icon123')).toEqual(Icon123);
    expect(result.current.getIcon('IconUser')).toEqual(IconUser);
    expect(result.current.getIcon('IconBuildingSkyscraper')).toEqual(
      IconBuildingSkyscraper,
    );
  });

  it('returns default icon if the specified icon key does not exist in the iconsState', () => {
    expect(result.current.getIcon('nonExistentKey')).toEqual(Icon123);
  });

  it('returns all icons in getIcons', () => {
    expect(result.current.getIcons()).toEqual(mockedStateIcons);
    expect(Object.keys(result.current.getIcons())).toHaveLength(3);
  });
});
