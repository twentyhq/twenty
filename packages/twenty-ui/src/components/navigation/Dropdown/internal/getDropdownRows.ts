import { getDropdownItems } from './getDropdownItems';
import { isDropdownRow } from './isDropdownRow';

export const getDropdownRows = (content: HTMLElement) =>
  getDropdownItems(content).filter((item) => isDropdownRow({ content, item }));
