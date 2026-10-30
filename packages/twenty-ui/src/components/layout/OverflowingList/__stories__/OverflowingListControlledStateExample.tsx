import { useState } from 'react';

import { Section } from '@ui/components/layout/Section/Section';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { OverflowingList } from '../OverflowingList';

export const OverflowingListControlledStateExample = () => {
  const [open, setOpen] = useState(false);
  const [requestedOpen, setRequestedOpen] = useState<boolean>();

  return (
    <Section.Root>
      <OverflowingList
        open={open}
        onOpenChange={setRequestedOpen}
        maxInlineCount={1}
        showOverflowCount
        style={{ width: 180 }}
      >
        {['First item', 'Second item', 'Third item'].map((label) => (
          <Button key={label}>{label}</Button>
        ))}
      </OverflowingList>
      <Button
        onClick={() => {
          if (isDefined(requestedOpen)) {
            setOpen(requestedOpen);
          }
        }}
      >
        Apply requested state
      </Button>
      <Text role="status">
        {!isDefined(requestedOpen)
          ? 'No request'
          : requestedOpen
            ? 'Open requested'
            : 'Close requested'}
      </Text>
    </Section.Root>
  );
};
