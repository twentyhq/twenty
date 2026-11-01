import { useRef } from 'react';

import { Section } from '@ui/components/layout/Section/Section';
import { Button } from '@ui/primitives/input/Button/Button';
import { type PopoverRootActions } from '@ui/primitives/surfaces/Popover/types/PopoverRootActions';

import { OverflowingList } from '../OverflowingList';
import { type OverflowingListProps } from '../types/OverflowingListProps';

type OverflowingListActionsExampleProps = {
  deferClose?: boolean;
  onOpenChange?: OverflowingListProps['onOpenChange'];
};

export const OverflowingListActionsExample = ({
  deferClose = false,
  onOpenChange,
}: OverflowingListActionsExampleProps) => {
  const actionsRef = useRef<PopoverRootActions>(null);

  return (
    <Section.Root>
      <OverflowingList
        aria-label="Items with public actions"
        role="group"
        actionsRef={actionsRef}
        showOverflowCount
        style={{ width: 180 }}
        onOpenChange={(nextOpen, details) => {
          if (!nextOpen && deferClose) {
            details.preventUnmountOnClose();
          }

          onOpenChange?.(nextOpen, details);
        }}
      >
        {[
          <Button key="first">First item</Button>,
          <Button key="close" onClick={() => actionsRef.current?.close()}>
            Close with actions
          </Button>,
          <Button key="third">Third item</Button>,
        ]}
      </OverflowingList>
      {deferClose && (
        <Button
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => actionsRef.current?.unmount()}
        >
          Finish exit
        </Button>
      )}
    </Section.Root>
  );
};
