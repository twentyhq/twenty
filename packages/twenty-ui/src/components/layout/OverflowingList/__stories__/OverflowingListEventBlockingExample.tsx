import { type SyntheticEvent, useState } from 'react';

import { Section } from '@ui/components/layout/Section/Section';
import { Button } from '@ui/primitives/input/Button/Button';

import { OverflowingList } from '../OverflowingList';
import { OVERFLOWING_LIST_STORY_ITEMS } from './OVERFLOWING_LIST_STORY_ITEMS';

type OverflowingListEventBlockingExampleProps = {
  onHostEvent: (event: SyntheticEvent) => void;
  onOverrideEvent: (event: SyntheticEvent) => void;
};

export const OverflowingListEventBlockingExample = ({
  onHostEvent,
  onOverrideEvent,
}: OverflowingListEventBlockingExampleProps) => {
  const [overrideEvent, setOverrideEvent] = useState<
    'click' | 'mouseDown' | 'pointerDown' | 'keyDown' | 'keyUp'
  >();
  const eventProps = {
    onClick: overrideEvent === 'click' ? onOverrideEvent : undefined,
    onMouseDown: overrideEvent === 'mouseDown' ? onOverrideEvent : undefined,
    onPointerDown:
      overrideEvent === 'pointerDown' ? onOverrideEvent : undefined,
    onKeyDown: overrideEvent === 'keyDown' ? onOverrideEvent : undefined,
    onKeyUp: overrideEvent === 'keyUp' ? onOverrideEvent : undefined,
  };

  return (
    <Section.Root>
      <div
        role="group"
        aria-label="Event host"
        onClick={onHostEvent}
        onMouseDown={onHostEvent}
        onPointerDown={onHostEvent}
        onKeyDown={onHostEvent}
        onKeyUp={onHostEvent}
      >
        <OverflowingList
          open
          maxInlineCount={1}
          showOverflowCount
          style={{ width: 180 }}
          triggerProps={eventProps}
          popupProps={eventProps}
        >
          {OVERFLOWING_LIST_STORY_ITEMS}
        </OverflowingList>
      </div>
      <Button onClick={() => setOverrideEvent(undefined)}>
        Default blocking
      </Button>
      {(['click', 'mouseDown', 'pointerDown', 'keyDown', 'keyUp'] as const).map(
        (eventName) => (
          <Button key={eventName} onClick={() => setOverrideEvent(eventName)}>
            Allow {eventName}
          </Button>
        ),
      )}
    </Section.Root>
  );
};
