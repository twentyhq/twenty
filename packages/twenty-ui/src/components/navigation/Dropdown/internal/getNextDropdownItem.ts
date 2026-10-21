import { isDefined } from '@ui/utilities/utils/isDefined';

import { getNextDropdownGridItem } from './getNextDropdownGridItem';

export const getNextDropdownItem = ({
  key,
  items,
  currentIndex,
  search,
  isSearch,
  isRightToLeft = false,
}: {
  key: string;
  items: HTMLElement[];
  currentIndex: number;
  search: HTMLInputElement | null;
  isSearch: boolean;
  isRightToLeft?: boolean;
}): HTMLElement | undefined => {
  const gridItem = getNextDropdownGridItem({
    key,
    items,
    currentItem: items[currentIndex],
    search,
    isRightToLeft,
  });

  if (isDefined(gridItem)) {
    return gridItem;
  }

  const lastIndex = items.length - 1;

  if (key === 'ArrowDown') {
    return items[currentIndex === lastIndex ? 0 : currentIndex + 1];
  }

  if (key === 'ArrowUp' && currentIndex === 0 && isDefined(search)) {
    return search;
  }

  if (key === 'ArrowUp') {
    return items[currentIndex <= 0 ? lastIndex : currentIndex - 1];
  }

  if (!isSearch && key === 'Home') {
    return items[0];
  }

  if (!isSearch && key === 'End') {
    return items[lastIndex];
  }

  return undefined;
};
