import { useState } from 'react';

import { Section } from '@ui/components/layout/Section/Section';
import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { Button } from '@ui/primitives/input/Button/Button';

import { ExpandableList } from '../ExpandableList';

export const ExpandableListResizeExample = () => {
  const [isNarrow, setIsNarrow] = useState(false);
  const [hasLongLabels, setHasLongLabels] = useState(false);

  return (
    <Section.Root>
      <ExpandableList
        aria-label="Resizable tags"
        showOverflowCount
        style={{ width: isNarrow ? 100 : 360 }}
      >
        {['Customer', 'Partner', 'Priority', 'Renewal'].map((label) => (
          <Tag key={label} color="blue" preventShrink>
            {hasLongLabels ? `${label} with a longer label` : label}
          </Tag>
        ))}
      </ExpandableList>
      <Button onClick={() => setIsNarrow(!isNarrow)}>
        {isNarrow ? 'Widen list' : 'Narrow list'}
      </Button>
      <Button onClick={() => setHasLongLabels(!hasLongLabels)}>
        {hasLongLabels ? 'Shorten labels' : 'Lengthen labels'}
      </Button>
    </Section.Root>
  );
};
