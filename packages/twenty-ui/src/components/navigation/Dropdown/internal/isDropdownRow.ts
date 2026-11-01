import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownSearch } from './getDropdownSearch';
import { isEnabledDropdownItem } from './isEnabledDropdownItem';

export const isDropdownRow = ({
  content,
  item,
}: {
  content: HTMLElement;
  item: HTMLElement;
}) =>
  item.hasAttribute('data-dropdown-item') &&
  isEnabledDropdownItem({ content, item }) &&
  (!item.hasAttribute('data-dropdown-back') ||
    !isDefined(getDropdownSearch(content)));
