import { atom } from 'jotai';

import { type IconComponent } from '@ui/display/icon/types/IconComponent';

export const iconsState = atom<Record<string, IconComponent>>({});
iconsState.debugLabel = 'iconsState';
