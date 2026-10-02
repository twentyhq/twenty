import { type ReactElement } from 'react';

import styles from '../OverflowingList.module.scss';
import { useFocusedElementUnmountRef } from './useFocusedElementUnmountRef';

type OverflowingListItemProps = {
  children: ReactElement;
  isHidden: boolean;
  isLastVisible: boolean;
  onFocusedItemUnmount: () => void;
};

export const OverflowingListItem = ({
  children,
  isHidden,
  isLastVisible,
  onFocusedItemUnmount,
}: OverflowingListItemProps) => {
  const resetFocusWhenFocusedItemUnmounts =
    useFocusedElementUnmountRef(onFocusedItemUnmount);

  return (
    <div
      ref={resetFocusWhenFocusedItemUnmounts}
      className={styles.item}
      data-hidden={isHidden || undefined}
      data-last-visible={isLastVisible || undefined}
      aria-hidden={isHidden || undefined}
      inert={isHidden}
    >
      {children}
    </div>
  );
};
