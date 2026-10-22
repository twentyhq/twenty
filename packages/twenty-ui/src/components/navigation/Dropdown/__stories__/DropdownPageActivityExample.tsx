import { Text } from '@ui/primitives/typography/Text/Text';

import { Dropdown } from '../Dropdown';
import { useDropdownPage } from '../hooks/useDropdownPage';

const PageActivity = ({ label }: { label: string }) => {
  const { isActive } = useDropdownPage();

  return (
    <Text role="status" aria-label={label}>
      {isActive ? 'Active' : 'Inactive'}
    </Text>
  );
};

export const DropdownPageActivityExample = () => (
  <Dropdown.Root type="panel">
    <Dropdown.Trigger>Page activity</Dropdown.Trigger>
    <Dropdown.Content aria-label="Page activity" keepMounted>
      <Dropdown.Page id="root">
        <PageActivity label="Root page activity" />
        <Dropdown.ActionItem page="details">Open details</Dropdown.ActionItem>
      </Dropdown.Page>
      <Dropdown.Page id="details">
        <PageActivity label="Details page activity" />
        <Dropdown.Back>Back to activity</Dropdown.Back>
      </Dropdown.Page>
    </Dropdown.Content>
  </Dropdown.Root>
);
