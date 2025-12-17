import { getUserDevice } from '@ui/utilities/device/getUserDevice';

export const getOsControlSymbol = () => {
  const device = getUserDevice();

  return device === 'mac' ? '⌘' : 'Ctrl';
};
