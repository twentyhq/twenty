import { type RefObject } from 'react';

import { type DropdownType } from '../types/DropdownType';

export type DropdownPageRegistration = {
  id: string;
  type: DropdownType;
  elementRef: RefObject<HTMLElement | null>;
};
