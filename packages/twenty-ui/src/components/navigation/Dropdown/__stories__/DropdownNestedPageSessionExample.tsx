import { Input } from '@ui/primitives/input/Input/Input';

import { Dropdown } from '../Dropdown';
import { useDropdownPage } from '../hooks/useDropdownPage';

type DropdownNestedPageSessionExampleProps = {
  controlledNested?: boolean;
  onNestedOpenChange?: (open: boolean) => void;
};

const NestedPageActions = ({
  controlledNested,
  onNestedOpenChange,
}: DropdownNestedPageSessionExampleProps) => {
  const { goToPage } = useDropdownPage();
  const content = (
    <Dropdown.Content aria-label="Nested actions" keepMounted>
      <Dropdown.ActionItem
        closeOnClick={false}
        onClick={() => goToPage('edit')}
      >
        Continue to editor
      </Dropdown.ActionItem>
    </Dropdown.Content>
  );

  if (controlledNested) {
    return (
      <Dropdown.Root type="menu" open onOpenChange={onNestedOpenChange}>
        <Dropdown.Trigger>Nested actions</Dropdown.Trigger>
        {content}
      </Dropdown.Root>
    );
  }

  return (
    <Dropdown.Submenu>
      <Dropdown.SubmenuTrigger openOnHover={false}>
        Nested actions
      </Dropdown.SubmenuTrigger>
      {content}
    </Dropdown.Submenu>
  );
};

export const DropdownNestedPageSessionExample = ({
  controlledNested,
  onNestedOpenChange,
}: DropdownNestedPageSessionExampleProps) => (
  <Dropdown.Root type="menu">
    <Dropdown.Trigger>Page actions</Dropdown.Trigger>
    <Dropdown.Content aria-label="Page actions" keepMounted>
      <Dropdown.Page id="root">
        <NestedPageActions
          controlledNested={controlledNested}
          onNestedOpenChange={onNestedOpenChange}
        />
      </Dropdown.Page>
      <Dropdown.Page id="edit" type="panel">
        <Input aria-label="Nested page draft" />
        <Dropdown.Back>Back to actions</Dropdown.Back>
      </Dropdown.Page>
    </Dropdown.Content>
  </Dropdown.Root>
);
