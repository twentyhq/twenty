import { atom } from 'recoil';

export const invalidAvatarUrlsState = atom<string[]>({
  key: 'invalidAvatarUrlsState',
  default: [],
});
