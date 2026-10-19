import { useId, useState } from 'react';

import { Input } from '@ui/primitives/input/Input/Input';

import { OverflowingList } from '../OverflowingList';

const StatefulValue = ({ name }: { name: string }) => {
  const identifier = useId();
  const [value, setValue] = useState('');

  return (
    <Input
      id={identifier}
      aria-label={name}
      style={{ width: 100 }}
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
};

export const OverflowingListStateExample = () => (
  <OverflowingList
    aria-label="Stateful values"
    showOverflowCount
    style={{ width: 180 }}
  >
    {['First value', 'Second value', 'Third value'].map((name) => (
      <StatefulValue key={name} name={name} />
    ))}
  </OverflowingList>
);
