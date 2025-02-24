type LimitedMouseEvent = Pick<
  MouseEvent,
  'button' | 'metaKey' | 'altKey' | 'ctrlKey' | 'shiftKey'
>;

export function isModifiedEvent({
  altKey,
  ctrlKey,
  shiftKey,
  metaKey,
}: LimitedMouseEvent) {
  return [altKey, ctrlKey, shiftKey, metaKey].some((key) => key);
}
