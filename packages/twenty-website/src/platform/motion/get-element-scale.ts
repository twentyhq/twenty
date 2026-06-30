export function getElementScale(element: HTMLElement): number {
  const layoutWidth = element.offsetWidth;

  if (layoutWidth === 0) {
    return 1;
  }
  return element.getBoundingClientRect().width / layoutWidth;
}
