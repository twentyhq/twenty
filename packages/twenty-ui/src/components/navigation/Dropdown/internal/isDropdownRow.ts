import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownRows } from './getDropdownRows';

export const isDropdownRow = (item: HTMLElement) => {
  const content = item.closest<HTMLElement>('[data-dropdown-content]');

  return isDefined(content) && getDropdownRows(content).includes(item);
};
