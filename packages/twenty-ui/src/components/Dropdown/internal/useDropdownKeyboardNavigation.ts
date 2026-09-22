import { useRef, type KeyboardEvent } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownKind } from '../types/DropdownKind';
import { getDropdownItems } from './getDropdownItems';
import { getDropdownTrigger } from './getDropdownTrigger';

const TYPEAHEAD_RESET_DELAY = 500;

export const useDropdownKeyboardNavigation = ({
  kind,
  isSubmenu,
  setOpen,
}: {
  kind: DropdownKind;
  isSubmenu: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const typeaheadRef = useRef({ text: '', timestamp: 0 });

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

    if (kind === 'panel') {
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
    const currentIndex = items.indexOf(target);
    const lastIndex = items.length - 1;
    let nextItem: HTMLElement | undefined;

    if (event.key === 'ArrowDown') {
      nextItem = items[currentIndex === lastIndex ? 0 : currentIndex + 1];
    }

    if (event.key === 'ArrowUp') {
      if (currentIndex === 0 && isDefined(search)) {
        event.preventDefault();
        search.focus();
        return;
      }

      nextItem = items[currentIndex <= 0 ? lastIndex : currentIndex - 1];
    }

    if (!isSearch && event.key === 'Home') {
      nextItem = items[0];
    }

    if (!isSearch && event.key === 'End') {
      nextItem = items[lastIndex];
    }

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
    const previous = typeaheadRef.current;
    const text =
      now - previous.timestamp > TYPEAHEAD_RESET_DELAY
        ? event.key
        : previous.text + event.key;
    typeaheadRef.current = { text, timestamp: now };
    const isRepeatedCharacter = [...text].every(
      (character) => character === text[0],
    );
    const query = (isRepeatedCharacter ? event.key : text).toLocaleLowerCase();
    const orderedItems = [
      ...items.slice(currentIndex + 1),
      ...items.slice(0, currentIndex + 1),
    ];
    const match = orderedItems.find((item) =>
      (item.getAttribute('aria-label') ?? item.textContent ?? '')
        .trim()
        .toLocaleLowerCase()
        .startsWith(query),
    );

    if (isDefined(match)) {
      event.preventDefault();
      match.focus();
    }
  };
};
