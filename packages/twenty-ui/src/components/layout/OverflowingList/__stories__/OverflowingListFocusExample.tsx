import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { OverflowingList } from '../OverflowingList';

const ITEM_LABELS = ['First item', 'Second item', 'Third item'];

export const OverflowingListFocusExample = () => {
  const [items, setItems] = useState(ITEM_LABELS);

  return (
    <OverflowingList
      aria-label="Focusable items"
      showOverflowCount
      maxInlineCount={1}
      style={{ width: 180 }}
    >
      {items.map((label) => (
        <Button
          key={label}
          style={{ width: 100 }}
          onClick={() =>
            setItems((currentItems) =>
              currentItems.filter((item) => item !== label),
            )
          }
        >
          {label}
        </Button>
      ))}
    </OverflowingList>
  );
};
