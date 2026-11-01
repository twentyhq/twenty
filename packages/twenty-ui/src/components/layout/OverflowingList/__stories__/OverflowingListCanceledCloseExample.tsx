import { useState } from 'react';

import { Section } from '@ui/components/layout/Section/Section';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { OverflowingList } from '../OverflowingList';

import { OVERFLOWING_LIST_STORY_ITEMS } from './OVERFLOWING_LIST_STORY_ITEMS';

export const OverflowingListCanceledCloseExample = () => {
  const [open, setOpen] = useState(true);
  const [closeRequestCount, setCloseRequestCount] = useState(0);

  return (
    <Section.Root>
      <OverflowingList
        aria-label="Cancelable responsive tags"
        open={open}
        showOverflowCount
        style={{ width: 500 }}
        onOpenChange={(nextOpen, details) => {
          if (nextOpen) {
            return;
          }

          details.cancel();
          setCloseRequestCount((count) => count + 1);
        }}
      >
        {OVERFLOWING_LIST_STORY_ITEMS}
      </OverflowingList>
      <Button onClick={() => setOpen(false)}>Close requested state</Button>
      <Button onClick={() => setOpen(true)}>Open requested state</Button>
      <Text role="status">
        Open: {String(open)}. Close requests: {closeRequestCount}.
      </Text>
    </Section.Root>
  );
};
