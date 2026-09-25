import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';
import { Input } from '@ui/primitives/input/Input/Input';

import { Dropdown } from '../Dropdown';

export const DropdownPanelExample = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('My view');

  return (
    <Dropdown.Root type="panel" open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger render={<Button>Edit view</Button>} />
      <Dropdown.Content aria-label="Edit view" width={280}>
        <Dropdown.Section>
          <Field.Root>
            <Field.Label>View name</Field.Label>
            <Input value={name} onValueChange={setName} />
          </Field.Root>
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
          <Dropdown.ActionItem disabled={!isNonEmptyString(name.trim())}>
            Save view
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
