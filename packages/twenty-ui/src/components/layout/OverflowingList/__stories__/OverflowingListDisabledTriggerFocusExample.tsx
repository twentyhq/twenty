import { useState } from 'react';

import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { Button } from '@ui/primitives/input/Button/Button';

import { OverflowingList } from '../OverflowingList';

export const OverflowingListDisabledTriggerFocusExample = () => {
  const [hasFocusedItem, setHasFocusedItem] = useState(true);

  const items = [
    <Button key="focused" onClick={() => setHasFocusedItem(false)}>
      Remove focused item
    </Button>,
    <Tag key="customer" color="blue">
      Customer
    </Tag>,
    <Tag key="partner" color="green">
      Partner
    </Tag>,
  ];

  return (
    <OverflowingList
      aria-label="Items with disabled trigger"
      maxInlineCount={1}
      showOverflowCount
      triggerProps={{ disabled: true }}
      style={{ width: 180 }}
    >
      {hasFocusedItem ? items : items.slice(1)}
    </OverflowingList>
  );
};
