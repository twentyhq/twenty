import { useDirection } from '@base-ui/react/direction-provider';
import { useState, type KeyboardEvent } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { dropdownItemActivation } from './dropdownItemActivation';
import { getDropdownItemLabel } from './getDropdownItemLabel';
import { getDropdownItems } from './getDropdownItems';
import { getDropdownRows } from './getDropdownRows';
import { getDropdownSearch } from './getDropdownSearch';
import { getDropdownSearchTarget } from './getDropdownSearchTarget';
import { getDropdownTrigger } from './getDropdownTrigger';
import { getNextDropdownGridItem } from './getNextDropdownGridItem';
import { getNextDropdownItem } from './getNextDropdownItem';
import { useDropdownContext } from './useDropdownContext';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

const TYPEAHEAD_RESET_DELAY = 500;
const IME_PROCESS_KEY_CODE = 229;

export const useDropdownKeyboardNavigation = () => {
  const { type, isSubmenu, setOpen, closeTree, tabForwardOutOfTree } =
    useDropdownContext();
  const direction = useDirection();
  const [typeahead, setTypeahead] = useState({ text: '', timestamp: 0 });

  return (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === IME_PROCESS_KEY_CODE
    ) {
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
    const isRightToLeft = direction === 'rtl';
    const backwardKey = doNotTranslate(
      isRightToLeft ? 'ArrowRight' : 'ArrowLeft',
    );
    const isSubmenuBackwardKey =
      isSubmenu && !isEditable && event.key === backwardKey;
    const backwardGridItem =
      isSubmenuBackwardKey && type !== 'panel'
        ? getNextDropdownGridItem({
            key: event.key,
            items: getDropdownItems(content),
            currentItem: target,
            search: null,
            isRightToLeft,
          })
        : undefined;
    const canMoveBackwardInGrid =
      isDefined(backwardGridItem) && backwardGridItem !== target;

    const shouldCloseSubmenu =
      isSubmenu &&
      (event.key === 'Escape' ||
        (isSubmenuBackwardKey && !canMoveBackwardInGrid));

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

    if (type === 'menu' && event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      closeTree(event.nativeEvent);
      return;
    }

    if (type === 'menu' && event.key === 'Tab' && isSubmenu) {
      event.preventDefault();
      tabForwardOutOfTree({
        ownerDocument: content.ownerDocument,
        tabOutEvent: event.nativeEvent,
      });
      return;
    }

    const search = getDropdownSearch(content);
    const isSearch = target === search;
    if (isEditable && !isSearch) {
      return;
    }

    const items = getDropdownRows(content);
    const searchTarget =
      isSearch && event.key === 'Enter'
        ? getDropdownSearchTarget(content)
        : undefined;

    if (isDefined(searchTarget)) {
      event.preventDefault();
      dropdownItemActivation.activate({
        item: searchTarget,
        event: event.nativeEvent,
      });
      return;
    }

    const currentIndex = items.indexOf(target);
    const nextItem = getNextDropdownItem({
      key: event.key,
      items,
      currentIndex,
      search,
      isSearch,
      isRightToLeft,
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
