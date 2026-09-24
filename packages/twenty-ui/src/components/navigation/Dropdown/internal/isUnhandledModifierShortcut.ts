import { type KeyboardEvent } from 'react';

export const isUnhandledModifierShortcut = (event: KeyboardEvent) =>
  (event.ctrlKey || event.metaKey) && !event.defaultPrevented;
