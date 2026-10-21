import { useState } from 'react';

import { IconArchive, IconCopy } from '@ui/icon';

import { Dropdown } from '../Dropdown';

const RECORDS = ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'];

export const DropdownContextMenuExample = () => {
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);

  return (
    <>
      <ul aria-label="Records">
        {RECORDS.map((record) => (
          <li
            key={record}
            onContextMenu={(event) => {
              event.preventDefault();
              setPoint({ x: event.clientX, y: event.clientY });
              setOpen(true);
            }}
          >
            {record}
          </li>
        ))}
      </ul>
      <Dropdown.Root type="menu" open={open} onOpenChange={setOpen}>
        <Dropdown.Content
          aria-label="Record actions"
          anchor={{
            getBoundingClientRect: () => new DOMRect(point.x, point.y, 0, 0),
          }}
        >
          <Dropdown.Section>
            <Dropdown.ActionItem startIcon={<IconCopy />}>
              Duplicate
            </Dropdown.ActionItem>
            <Dropdown.ActionItem startIcon={<IconArchive />}>
              Archive
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Root>
    </>
  );
};
