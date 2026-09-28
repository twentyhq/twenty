import { useSyncExternalStore } from 'react';

import { getOsShortcutSeparator } from '@ui/utilities/device/getOsShortcutSeparator';

const subscribeToUserDevice = () => () => {};

const getServerOsShortcutSeparator = () => ' ';

export const useOsShortcutSeparator = () =>
  useSyncExternalStore(
    subscribeToUserDevice,
    getOsShortcutSeparator,
    getServerOsShortcutSeparator,
  );
