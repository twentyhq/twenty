import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { ExpandableList } from '../ExpandableList';

export const ExpandableListControlledFocusExample = () => {
  const [showOverflowCount, setShowOverflowCount] = useState(false);

  return (
    <ExpandableList
      showOverflowCount={showOverflowCount}
      style={{ width: 168 }}
    >
      <Button
        key="toggle-count"
        aria-pressed={showOverflowCount}
        style={{ width: 80 }}
        onClick={() => setShowOverflowCount((isVisible) => !isVisible)}
      >
        Toggle count
      </Button>
      <Button key="second-item" style={{ width: 80 }}>
        Second item
      </Button>
      <Button key="third-item" style={{ width: 80 }}>
        Third item
      </Button>
    </ExpandableList>
  );
};
