import { type DropdownRegistry } from './DropdownRegistry';

export const createDropdownRegistry = (): DropdownRegistry => ({
  rows: new Set(),
  searches: new Set(),
  pages: new Set(),
  listeners: new Set(),
});
