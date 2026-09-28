import { useState, type KeyboardEvent } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownType } from '../types/DropdownType';
import { getDropdownItemLabel } from './getDropdownItemLabel';
import { getDropdownItems } from './getDropdownItems';
import { getDropdownSearchTarget } from './getDropdownSearchTarget';
import { getDropdownTrigger } from './getDropdownTrigger';
import { getNextDropdownItem } from './getNextDropdownItem';

const TYPEAHEAD_RESET_DELAY = 500;

export const useDropdownKeyboardNavigation = ({
  type,
  isSubmenu,
  setOpen,
}: {
  type: DropdownType;
  isSubmenu: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [typeahead, setTypeahead] = useState({ text: '', timestamp: 0 });

  return (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) {
      return;
    }

    const content = event.currentTarget;
    const target = event.target;

    if (
      !(target instanceof HTMLElement) ||
      target.closest('[data-dropdown-content]') !== content
    ) {
      return;
    }

    const isEditable = target.matches(
      'input,textarea,select,[contenteditable="true"]',
    );
    const isRightToLeft = getComputedStyle(content).direction === 'rtl';
    const backwardKey = isRightToLeft ? 'ArrowRight' : 'ArrowLeft';

    const shouldCloseSubmenu =
      isSubmenu &&
      (event.key === 'Escape' || (!isEditable && event.key === backwardKey));

    if (shouldCloseSubmenu) {
      event.preventDefault();
      event.stopPropagation();
      getDropdownTrigger(content)?.focus();
      setOpen(false);
      return;
    }

    if (type === 'panel') {
      return;
    }

    const search = content.querySelector<HTMLInputElement>(
      '[data-dropdown-search]:not(:disabled)',
    );
    const isSearch = target === search;
    if (isEditable && !isSearch) {
      return;
    }

    const items = getDropdownItems(content).filter(
      (item) => !isDefined(search) || !item.hasAttribute('data-dropdown-back'),
    );
    const searchTarget =
      isSearch && event.key === 'Enter' && !event.nativeEvent.isComposing
        ? getDropdownSearchTarget(content)
        : undefined;

    if (isDefined(searchTarget)) {
      event.preventDefault();
      searchTarget.click();
      return;
    }

    const currentIndex = items.indexOf(target);
    const nextItem = getNextDropdownItem({
      key: event.key,
      items,
      currentIndex,
      search,
      isSearch,
    });

    if (isDefined(nextItem)) {
      event.preventDefault();
      nextItem.focus();
      return;
    }

    if (
      isEditable ||
      event.key.length !== 1 ||
      event.key === ' ' ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    const now = Date.now();
    const text =
      now - typeahead.timestamp > TYPEAHEAD_RESET_DELAY
        ? event.key
        : typeahead.text + event.key;
    setTypeahead({ text, timestamp: now });
    const isRepeatedCharacter = [...text].every(
      (character) => character === text[0],
    );
    const query = (isRepeatedCharacter ? event.key : text).toLocaleLowerCase();
    const orderedItems = [
      ...items.slice(currentIndex + 1),
      ...items.slice(0, currentIndex + 1),
    ];
    const match = orderedItems.find((item) =>
      getDropdownItemLabel(item).trim().toLocaleLowerCase().startsWith(query),
    );

    if (isDefined(match)) {
      event.preventDefault();
      match.focus();
    }
  };
};
