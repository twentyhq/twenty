import { type ReactElement } from 'react';

import styles from '../ExpandableList.module.scss';
import { useFocusedElementUnmountRef } from './useFocusedElementUnmountRef';

type ExpandableListItemProps = {
  children: ReactElement;
  isHidden: boolean;
  isLastVisible: boolean;
  onFocusedItemUnmount: () => void;
};

export const ExpandableListItem = ({
  children,
  isHidden,
  isLastVisible,
  onFocusedItemUnmount,
}: ExpandableListItemProps) => {
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
