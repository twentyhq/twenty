import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { MenuItemSuggestion } from '../MenuItemSuggestion';

const meta: Meta<typeof MenuItemSuggestion> = {
  title: 'UI/Components/Navigation/MenuItemSuggestion',
  component: MenuItemSuggestion,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 280 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
};

export default meta;
type Story = StoryObj<typeof MenuItemSuggestion>;

export const Display: Story = {
  args: { text: 'Acme', contextualText: 'Company', selected: false },
  argTypes: { onClick: { control: false } },
  render: (args) => (
    <Text
      render={<ul />}
      style={{ margin: 0, padding: 0, listStyle: 'none', width: '100%' }}
    >
      <MenuItemSuggestion {...args} />
    </Text>
  ),
};
