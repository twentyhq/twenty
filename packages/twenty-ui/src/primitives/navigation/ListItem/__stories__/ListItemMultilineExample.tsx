import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Checkbox } from '@ui/primitives/input/Checkbox/Checkbox';
import { Text } from '@ui/primitives/typography/Text/Text';

import { ListItem } from '../ListItem';

type ListItemMultilineExampleProps = {
  disabled?: boolean;
  onOpen?: () => void;
  onArchive?: () => void;
};

export const ListItemMultilineExample = ({
  disabled = false,
  onOpen,
  onArchive,
}: ListItemMultilineExampleProps) => {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState(false);

  return (
    <ListItem
      role="group"
      aria-label="Planning document"
      aria-disabled={disabled || undefined}
      active={active}
      selected={selected}
      selectionAppearance="accent"
      disabled={disabled}
      descriptionPlacement="below"
      description="Review the proposed timeline and confirm the next steps with the team."
      startIcon={
        <Checkbox
          aria-label="Select planning document"
          checked={selected}
          onCheckedChange={setSelected}
          disabled={disabled}
        />
      }
      endIcon={
        <Text render={<span />} size="sm">
          09:48
        </Text>
      }
      actions={
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onArchive}
        >
          Archive
        </Button>
      }
    >
      <Button
        variant="ghost"
        size="sm"
        aria-pressed={active}
        disabled={disabled}
        onClick={() => {
          setActive(!active);
          onOpen?.();
        }}
      >
        Quarterly planning
      </Button>
    </ListItem>
  );
};
