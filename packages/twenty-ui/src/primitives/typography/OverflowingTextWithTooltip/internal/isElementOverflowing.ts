export const isElementOverflowing = (element: HTMLElement | null) =>
  element !== null &&
  (element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth);
