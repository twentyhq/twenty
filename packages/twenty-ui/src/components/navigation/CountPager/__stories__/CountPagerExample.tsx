import { useState } from 'react';

import { CountPager } from '../CountPager';
import { type CountPagerProps } from '../types/CountPagerProps';

export const CountPagerExample = ({
  disabled,
  positionPlacement,
}: Pick<CountPagerProps, 'disabled' | 'positionPlacement'>) => {
  const [index, setIndex] = useState(0);

  return (
    <CountPager
      aria-label="Review item"
      index={index}
      count={3}
      onIndexChange={setIndex}
      positionText={`${index + 1} of 3`}
      previousLabel="Previous item"
      nextLabel="Next item"
      disabled={disabled}
      positionPlacement={positionPlacement}
    />
  );
};
