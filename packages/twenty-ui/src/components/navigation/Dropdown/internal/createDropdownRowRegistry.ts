import { type DropdownRowRegistry } from './DropdownRowRegistry';

export const createDropdownRowRegistry = (): DropdownRowRegistry => ({
  rows: new Set(),
  searches: new Set(),
  pages: new Set(),
  listeners: new Set(),
});
