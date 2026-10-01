import { useState } from 'react';

import { Tag } from '@ui/primitives/data-display/Tag/Tag';

export const ExpandableListMutableTag = () => {
  const [hasLongLabel, setHasLongLabel] = useState(false);

  return (
    <Tag
      color="blue"
      preventShrink
      aria-label="Toggle tag label"
      onClick={() => setHasLongLabel(!hasLongLabel)}
    >
      {hasLongLabel ? 'Customer with a much longer description' : 'Customer'}
    </Tag>
  );
};
