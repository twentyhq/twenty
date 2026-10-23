import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { themeCssVariables } from '@ui/theme';

import { CountPager } from '../CountPager';

export const CountPagerCollectionExample = ({
  onIndexChange,
}: {
  onIndexChange: (index: number) => void;
}) => {
  const [selection, setSelection] = useState({ index: 1, count: 3 });

  return (
    <Text
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: themeCssVariables.spacing[4],
      }}
    >
      <CountPager
        aria-label="Review item"
        index={selection.index}
        count={selection.count}
        onIndexChange={(index) => {
          onIndexChange(index);
          setSelection({ ...selection, index });
        }}
        positionText={`${selection.index + 1} of ${selection.count}`}
        previousLabel="Previous item"
        nextLabel="Next item"
      />
      <Button size="sm" onClick={() => setSelection({ index: 0, count: 1 })}>
        Replace collection
      </Button>
    </Text>
  );
};
