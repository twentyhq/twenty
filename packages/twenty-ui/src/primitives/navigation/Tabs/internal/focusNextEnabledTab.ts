import { type TextDirection } from '@base-ui/react/direction-provider';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type TabsListProps } from '../types/TabsListProps';

type FocusNextEnabledTabOptions = {
  event: Parameters<NonNullable<TabsListProps['onKeyDown']>>[0];
  direction: TextDirection;
  loopFocus: boolean;
};

const TAB_SELECTOR = '[role="tab"]';
const TAB_LIST_SELECTOR = '[role="tablist"]';
const UNAVAILABLE_TAB_ANCESTOR_SELECTOR = '[hidden], [inert]';

const isUnavailableTab = (tab: HTMLElement) =>
  tab.hasAttribute('data-disabled') ||
  tab.hasAttribute('disabled') ||
  tab.getAttribute('aria-disabled') === 'true' ||
  isDefined(tab.closest(UNAVAILABLE_TAB_ANCESTOR_SELECTOR));

export const focusNextEnabledTab = ({
  event,
  direction,
  loopFocus,
}: FocusNextEnabledTabOptions) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return;
  }

  const list = event.currentTarget;
  const tabs: HTMLElement[] = [];
  list.querySelectorAll<HTMLElement>(TAB_SELECTOR).forEach((tab) => {
    if (tab.closest(TAB_LIST_SELECTOR) !== list) {
      return;
    }

    tabs.push(tab);
  });
  const currentIndex = tabs.findIndex((tab) => tab === event.target);

  if (currentIndex === -1) {
    return;
  }

  const horizontalKeys =
    direction === 'rtl'
      ? ['ArrowLeft', 'ArrowRight']
      : ['ArrowRight', 'ArrowLeft'];
  const [forwardKey, backwardKey] =
    list.getAttribute('data-orientation') === 'vertical'
      ? ['ArrowDown', 'ArrowUp']
      : horizontalKeys;

  if (![forwardKey, backwardKey, 'Home', 'End'].includes(event.key)) {
    return;
  }

  const isBackward = event.key === backwardKey;
  let candidateIndex = currentIndex + (isBackward ? -1 : 1);

  if (event.key === 'Home') {
    candidateIndex = 0;
  }

  if (event.key === 'End') {
    candidateIndex = tabs.length - 1;
  }

  const isOutsideTabs = candidateIndex < 0 || candidateIndex >= tabs.length;
  const wrappedIndex = isBackward ? tabs.length - 1 : 0;
  const candidate =
    tabs[isOutsideTabs && loopFocus ? wrappedIndex : candidateIndex];

  if (!isDefined(candidate) || !isUnavailableTab(candidate)) {
    return;
  }

  event.preventBaseUIHandler();
  event.preventDefault();

  const enabledTabs = tabs.filter((tab) => !isUnavailableTab(tab));
  let nextTab: HTMLElement | undefined;

  if (event.key === 'Home') {
    nextTab = enabledTabs[0];
  }

  if (event.key === 'End') {
    nextTab = enabledTabs[enabledTabs.length - 1];
  }

  if (event.key === forwardKey || event.key === backwardKey) {
    const orderedTabs = isBackward ? [...enabledTabs].reverse() : enabledTabs;
    nextTab = orderedTabs.find((tab) =>
      isBackward
        ? tabs.indexOf(tab) < currentIndex
        : tabs.indexOf(tab) > currentIndex,
    );
    nextTab ??= loopFocus ? orderedTabs[0] : undefined;
  }

  if (!isDefined(nextTab) || nextTab === event.target) {
    return;
  }

  event.stopPropagation();
  const nextEnabledTab = nextTab;
  queueMicrotask(() => nextEnabledTab.focus());
};
