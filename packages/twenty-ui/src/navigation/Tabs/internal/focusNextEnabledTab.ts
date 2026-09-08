import { type TextDirection } from '@base-ui/react/direction-provider';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type TabsListProps } from '../types/TabsListProps';

export const focusNextEnabledTab = (
  event: Parameters<NonNullable<TabsListProps['onKeyDown']>>[0],
  direction: TextDirection,
  loopFocus: boolean,
) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return;
  }

  const list = event.currentTarget;
  const tabs = Array.from(
    list.querySelectorAll<HTMLElement>('[role="tab"]'),
  ).filter((tab) => tab.closest('[role="tablist"]') === list);
  const currentIndex = tabs.findIndex((tab) => tab === event.target);

  if (currentIndex === -1) {
    return;
  }

  const horizontalKeys =
    direction === 'rtl'
      ? ['ArrowLeft', 'ArrowRight']
      : ['ArrowRight', 'ArrowLeft'];
  const [forwardKey, backwardKey] =
    list.getAttribute('aria-orientation') === 'vertical'
      ? ['ArrowDown', 'ArrowUp']
      : horizontalKeys;

  if (![forwardKey, backwardKey, 'Home', 'End'].includes(event.key)) {
    return;
  }

  // Base UI 1.5 intentionally focuses disabled tabs; Twenty skips them.
  event.preventBaseUIHandler();
  event.preventDefault();

  const enabledTabs = tabs.filter(
    (tab) =>
      !tab.hasAttribute('data-disabled') &&
      !tab.hasAttribute('disabled') &&
      tab.getAttribute('aria-disabled') !== 'true' &&
      !tab.closest('[hidden], [inert]'),
  );

  if (event.key === 'Home') {
    enabledTabs[0]?.focus();
    return;
  }

  if (event.key === 'End') {
    enabledTabs[enabledTabs.length - 1]?.focus();
    return;
  }

  const isBackward = event.key === backwardKey;
  const orderedTabs = isBackward ? [...enabledTabs].reverse() : enabledTabs;
  const nextTab = orderedTabs.find((tab) =>
    isBackward
      ? tabs.indexOf(tab) < currentIndex
      : tabs.indexOf(tab) > currentIndex,
  );

  if (isDefined(nextTab)) {
    nextTab.focus();
    return;
  }

  if (loopFocus) {
    orderedTabs[0]?.focus();
  }
};
