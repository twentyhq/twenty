export const getDropdownDismissTarget = (event: Event) => {
  if (event instanceof FocusEvent) {
    return event.type === 'focusout' && event.relatedTarget instanceof Element
      ? event.relatedTarget
      : null;
  }

  return event.target instanceof Element ? event.target : null;
};
