import { getUserDevice } from '@ui/utilities/device/getUserDevice';

export const getOsControlSymbol = () => {
  const device = getUserDevice();

  // Ctrl is a keyboard key label and should not be translated
  // eslint-disable-next-line lingui/no-unlocalized-strings
  return device === 'mac' ? '⌘' : 'Ctrl';
};
