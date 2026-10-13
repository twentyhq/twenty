import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownItems } from './getDropdownItems';
import { getDropdownSearch } from './getDropdownSearch';

export const getDropdownRows = (content: HTMLElement) => {
  const hasSearch = isDefined(getDropdownSearch(content));

  return getDropdownItems(content).filter(
    (item) => !hasSearch || !item.hasAttribute('data-dropdown-back'),
  );
};
