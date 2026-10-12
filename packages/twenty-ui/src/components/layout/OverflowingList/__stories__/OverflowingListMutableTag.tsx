import { useState } from 'react';

import { Tag } from '@ui/primitives/data-display/Tag/Tag';

export const OverflowingListMutableTag = () => {
  const [hasLongLabel, setHasLongLabel] = useState(false);

  return (
    <Tag
      color="blue"
      truncate={false}
      style={{ minWidth: 'fit-content' }}
      render={
        <button
          type="button"
          aria-label="Toggle tag label"
          onClick={() => setHasLongLabel(!hasLongLabel)}
        />
      }
    >
      {hasLongLabel ? 'Customer with a much longer description' : 'Customer'}
    </Tag>
  );
};
