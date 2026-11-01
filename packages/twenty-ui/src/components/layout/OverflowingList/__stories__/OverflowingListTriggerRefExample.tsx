import { useRef, useState } from 'react';

import { Section } from '@ui/components/layout/Section/Section';
import { Text } from '@ui/primitives/typography/Text/Text';

import { OverflowingList } from '../OverflowingList';
import { OVERFLOWING_LIST_STORY_ITEMS } from './OVERFLOWING_LIST_STORY_ITEMS';

export const OverflowingListTriggerRefExample = () => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <Section.Root>
      <OverflowingList
        showOverflowCount
        style={{ width: 180 }}
        triggerProps={{
          ref: (element) => {
            triggerRef.current = element;
          },
          onKeyDown: (event) => {
            if (event.key === 'r') {
              setRenderCount((currentCount) => currentCount + 1);
            }
          },
        }}
      >
        {OVERFLOWING_LIST_STORY_ITEMS}
      </OverflowingList>
      <Text role="status">Renders: {renderCount}</Text>
    </Section.Root>
  );
};
