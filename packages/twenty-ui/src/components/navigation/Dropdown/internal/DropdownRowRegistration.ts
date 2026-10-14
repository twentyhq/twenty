import { type RefObject } from 'react';

import { type DropdownRow } from './DropdownRow';

export type DropdownRowRegistration = Omit<DropdownRow, 'element'> & {
  elementRef: RefObject<HTMLElement | null>;
};
