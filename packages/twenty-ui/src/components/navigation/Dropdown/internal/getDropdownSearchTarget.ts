import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownItems } from './getDropdownItems';

export const getDropdownSearchTarget = (content: HTMLElement) => {
  if (content.dataset.type === 'panel') {
    return undefined;
  }

  const search = content.querySelector<HTMLInputElement>(
    '[data-dropdown-search]:not(:disabled)',
  );

  if (!isDefined(search) || !isNonEmptyString(search.value.trim())) {
    return undefined;
  }

  return getDropdownItems(content).find((item) =>
    item.hasAttribute('data-dropdown-option-item'),
  );
};
