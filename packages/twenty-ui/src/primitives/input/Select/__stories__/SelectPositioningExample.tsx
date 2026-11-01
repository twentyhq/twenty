import { useState } from 'react';

import { IconChevronDown, IconChevronUp } from '@ui/icon';

import { Select } from '../Select';
import { type SelectRootProps } from '../types/SelectRootProps';
import { SELECT_ITEMS } from './selectItems';

export const SelectPositioningExample = (props: SelectRootProps<string>) => {
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setBoundary} style={{ width: 520, height: 320, padding: 24 }}>
      <Select.Root {...props} items={SELECT_ITEMS}>
        <Select.Label>Fruit</Select.Label>
        <Select.Trigger style={{ width: 160 }}>
          <Select.Value placeholder="Choose a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <div
          ref={setAnchor}
          role="region"
          aria-label="Popup anchor"
          style={{ width: 180, height: 40, marginInlineStart: 240 }}
        >
          Custom anchor
        </div>
        <Select.Portal>
          <Select.Positioner
            anchor={anchor}
            positionMethod="fixed"
            side="bottom"
            align="end"
            alignItemWithTrigger={false}
            sideOffset={({ anchor: anchorDimensions }) =>
              anchorDimensions.height / 2
            }
            alignOffset={() => 6}
            collisionBoundary={boundary ?? undefined}
            collisionPadding={12}
            collisionAvoidance={{ side: 'none', align: 'none' }}
            sticky
            disableAnchorTracking
            data-testid="custom-positioner"
          >
            <Select.Popup style={{ overflow: 'hidden' }}>
              <Select.Arrow data-testid="select-arrow" />
              <Select.ScrollUpArrow keepMounted aria-hidden>
                <IconChevronUp />
              </Select.ScrollUpArrow>
              <Select.List style={{ maxHeight: 96, overflow: 'auto' }}>
                <Select.Group>
                  <Select.GroupLabel>Everyday</Select.GroupLabel>
                  {SELECT_ITEMS.map(({ value, label }) => (
                    <Select.Item key={value} value={value}>
                      <Select.ItemText>{label}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.List>
              <Select.ScrollDownArrow keepMounted aria-hidden>
                <IconChevronDown />
              </Select.ScrollDownArrow>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};
