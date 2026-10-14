import { type RefObject } from 'react';

import { type DropdownPageRegistration } from './DropdownPageRegistration';
import { type DropdownRowRegistration } from './DropdownRowRegistration';

export type DropdownRegistry = {
  rows: Set<DropdownRowRegistration>;
  searches: Set<RefObject<HTMLInputElement | null>>;
  pages: Set<DropdownPageRegistration>;
  listeners: Set<() => void>;
};
