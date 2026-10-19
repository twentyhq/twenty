import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownItems } from './getDropdownItems';
import { getDropdownSearch } from './getDropdownSearch';

export const getDropdownSearchTarget = (content: HTMLElement) => {
  if (content.dataset.type === 'panel') {
    return undefined;
  }

  const search = getDropdownSearch(content);

  if (
    !isDefined(search) ||
    search !== content.ownerDocument.activeElement ||
    !isNonEmptyString(search.value.trim())
  ) {
    return undefined;
  }

  return getDropdownItems(content).find((item) =>
    item.hasAttribute('data-dropdown-option-item'),
  );
};
