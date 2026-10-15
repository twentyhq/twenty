import { isDefined } from '@ui/utilities/utils/isDefined';

export const isElementOverflowing = (element: HTMLElement | null) =>
  isDefined(element) &&
  (element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth);
