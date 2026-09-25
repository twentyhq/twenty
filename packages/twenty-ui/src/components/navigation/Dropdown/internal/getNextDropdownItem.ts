import { isDefined } from '@ui/utilities/utils/isDefined';

export const getNextDropdownItem = ({
  key,
  items,
  currentIndex,
  search,
  isSearch,
}: {
  key: string;
  items: HTMLElement[];
  currentIndex: number;
  search: HTMLInputElement | null;
  isSearch: boolean;
}): HTMLElement | undefined => {
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
