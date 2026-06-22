import { type KeyboardEvent } from 'react';

export const handleClickableElementKeyDown = (
  event: KeyboardEvent<HTMLElement>,
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
  }
};
