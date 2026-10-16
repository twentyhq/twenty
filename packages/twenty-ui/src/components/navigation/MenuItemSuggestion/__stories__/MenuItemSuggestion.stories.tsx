import { type Meta, type StoryObj } from '@storybook/react-vite';
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
    <ul>
      <MenuItemSuggestion {...args} />
    </ul>
  ),
};
