import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';
import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { SettingsRow } from '@ui/components/settings/SettingsRow/SettingsRow';

import { SearchInputExample } from './SearchInputExample';

const meta: Meta<typeof SearchInputExample> = {
  id: 'ui-input-searchinput',
  title: 'UI/Components/Input/SearchInput',
  component: SearchInputExample,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SearchInputExample>;

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Search...',
    disabled: true,
  },
};

export const Compact: Story = {
  args: {
    placeholder: 'Search...',
    size: 'sm',
  },
};

export const WithFilter: Story = {
  args: {
    placeholder: 'Search people...',
    filterButtonAriaLabel: 'Filter people',
    filterDropdown: (filterButton) => (
      <Dropdown.Root type="panel">
        <Dropdown.Trigger render={filterButton} />
        <Dropdown.Content align="end">
          <Dropdown.Section>
            <SettingsRow switchProps={{ defaultChecked: true }}>
              Include inactive people
            </SettingsRow>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Root>
    ),
  },
};
