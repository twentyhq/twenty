export const isPageZoomGesture = (
  event: Pick<WheelEvent, 'ctrlKey' | 'metaKey'>,
): boolean => event.ctrlKey || event.metaKey;
