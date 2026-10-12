import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const useOverflowingListClientLayout = () =>
  useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
