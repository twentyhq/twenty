type LimitedMouseEvent = Pick<
  MouseEvent,
  'button' | 'metaKey' | 'altKey' | 'ctrlKey' | 'shiftKey'
>;

export const isNavigationModifierPressed = ({
  altKey,
  ctrlKey,
  shiftKey,
  metaKey,
  button,
}: LimitedMouseEvent) => {
  const pressedKey = [altKey, ctrlKey, shiftKey, metaKey].some((key) => key);
  const isLeftClick = button === 0;
  return pressedKey || !isLeftClick;
};
