import { getUserDevice } from '@ui/utilities/device/getUserDevice';

export const getOsShortcutSeparator = () => {
  const device = getUserDevice();
  return device === 'mac' ? '' : ' ';
};
