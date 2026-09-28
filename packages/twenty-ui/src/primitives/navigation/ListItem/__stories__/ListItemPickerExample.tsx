import { useState } from 'react';

import { Avatar, Tag } from '@ui/primitives/data-display';
import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';

type ListItemPickerExampleProps = {
  multiple?: boolean;
  onSelectionChange?: (selection: string[]) => void;
};

const PEOPLE = ['Alex Morgan', 'Sam Taylor', 'Unavailable teammate'];

export const ListItemPickerExample = ({
  multiple = false,
  onSelectionChange,
}: ListItemPickerExampleProps) => {
  const [selection, setSelection] = useState<string[]>([]);

  const handleSelect = (name: string) => {
    const nextSelection = multiple
      ? selection.includes(name)
        ? selection.filter((selectedName) => selectedName !== name)
        : [...selection, name]
      : [name];

    setSelection(nextSelection);
    onSelectionChange?.(nextSelection);
  };

  return (
    <div role="group" aria-label="Teammates">
      {PEOPLE.map((name) => {
        const selected = selection.includes(name);
        const disabled = name === 'Unavailable teammate';

        return (
          <ListItem
            key={name}
            render={<button type="button" disabled={disabled} />}
            aria-pressed={selected}
            selected={selected}
            disabled={disabled}
            indicator={multiple ? 'checkbox' : 'check'}
            startIcon={multiple ? undefined : <Avatar name={name} size="md" />}
            onClick={() => handleSelect(name)}
          >
            {multiple ? <Tag color="blue">{name}</Tag> : name}
          </ListItem>
        );
      })}
    </div>
  );
};
