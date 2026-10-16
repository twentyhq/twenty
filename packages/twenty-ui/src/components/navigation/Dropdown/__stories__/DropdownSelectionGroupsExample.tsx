import { Button } from '@ui/primitives/input/Button/Button';

import { Dropdown } from '../Dropdown';

export const DropdownSelectionGroupsExample = () => (
  <Dropdown.Root type="picker">
    <Dropdown.Trigger render={<Button>Review settings</Button>} />
    <Dropdown.Content aria-label="Review settings" width={280}>
      <Dropdown.Section label="Owner">
        <Dropdown.SelectionGroup
          id="owner"
          aria-label="Owner"
          defaultValue="grace"
          closeOnSelect={false}
        >
          <Dropdown.OptionItem value="ada">Ada Lovelace</Dropdown.OptionItem>
          <Dropdown.OptionItem value="grace">Grace Hopper</Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.Section label="Watchers">
        <Dropdown.SelectionGroup
          id="watchers"
          aria-label="Watchers"
          multiple
          defaultValue={['ada']}
        >
          <Dropdown.OptionItem value="ada">Ada Lovelace</Dropdown.OptionItem>
          <Dropdown.OptionItem value="margaret">
            Margaret Hamilton
          </Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.ActionItem>Invite reviewer</Dropdown.ActionItem>
    </Dropdown.Content>
  </Dropdown.Root>
);
