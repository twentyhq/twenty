import { useState } from 'react';

import { Section } from '@ui/components/layout/Section/Section';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { OverflowingList } from '../OverflowingList';
import { OVERFLOWING_LIST_STORY_ITEMS } from './OVERFLOWING_LIST_STORY_ITEMS';

export const OverflowingListControlledExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <Section.Root>
      <Section.Header title="Company tags" />
      <Text>Open the count to see all tags.</Text>
      <OverflowingList
        open={open}
        onOpenChange={setOpen}
        showOverflowCount
        overflowLabel="Show all company tags"
        style={{ width: 180 }}
        triggerProps={{ render: <Button variant="outline" size="sm" /> }}
      >
        {OVERFLOWING_LIST_STORY_ITEMS}
      </OverflowingList>
    </Section.Root>
  );
};
