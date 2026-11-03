export const isPageZoomGesture = (
  event: Pick<WheelEvent, 'ctrlKey'>,
): boolean => event.ctrlKey;
