import { useMediaQuery } from 'react-responsive';

export enum DeviceType {
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  MOBILE = 'MOBILE',
}

export const useDeviceType = () => {
  const isTablet = useMediaQuery({
    query: '(max-width: 1199px) and (min-width: 810px)',
  });
  const isMobile = useMediaQuery({ query: '(max-width: 809px)' });

  if (isMobile) {
    return DeviceType.MOBILE;
  }
  if (isTablet) {
    return DeviceType.TABLET;
  }
  return DeviceType.DESKTOP;
};
