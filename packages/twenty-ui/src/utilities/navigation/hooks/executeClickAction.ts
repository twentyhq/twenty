import { MouseEvent } from 'react';

type ClickHandler = (() => void) | ((event: MouseEvent<HTMLElement>) => void);

export const executeClickAction = (
  event: MouseEvent<HTMLElement>,
  onClick: ClickHandler,
) => {
  if (onClick.length === 1) {
    (onClick as (event: MouseEvent<HTMLElement>) => void)(event);
    return;
  }

  (onClick as () => void)();
};
