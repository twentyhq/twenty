// oxlint-disable lingui/no-unlocalized-strings -- Ctrl is a platform keycap symbol.
import { getUserDevice } from '@ui/utilities/device/getUserDevice';

export const getOsControlSymbol = () => {
  const device = getUserDevice();

  return device === 'mac' || device === 'ios' ? '⌘' : 'Ctrl';
};
