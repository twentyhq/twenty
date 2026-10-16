import { getUserDevice } from '@ui/utilities/device/getUserDevice';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

export const getOsControlSymbol = () => {
  const device = getUserDevice();

  return device === 'mac' || device === 'ios' ? '⌘' : doNotTranslate('Ctrl');
};
