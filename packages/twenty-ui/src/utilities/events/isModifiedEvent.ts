type LimitedMouseEvent = Pick<
  MouseEvent,
  'button' | 'metaKey' | 'altKey' | 'ctrlKey' | 'shiftKey'
>;

export const isModifiedEvent = ({
  altKey,
  ctrlKey,
  shiftKey,
  metaKey,
}: LimitedMouseEvent) =>
  [altKey, ctrlKey, shiftKey, metaKey].some((key) => key);
