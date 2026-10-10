import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ListItemButton } from '@ui/components/navigation/ListItemButton/ListItemButton';
import { IconCopy, IconUser } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

const ROW_STYLE = { width: 280 };
const SIBLING_STYLE = { display: 'flex', alignItems: 'center', gap: 8 };

const meta: Meta<typeof ListItemButton> = {
  id: 'ui-components-listitembutton',
  title: 'UI/Components/Navigation/ListItemButton',
  component: ListItemButton,
  decorators: [ComponentDecorator],
  args: {
    children: 'Duplicate',
    startIcon: <IconCopy />,
    description: 'Create a copy',
    style: ROW_STYLE,
  },
  argTypes: {
    startIcon: { control: false },
    endIcon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ListItemButton>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Selected: Story = {
  args: {
    children: 'Show archived records',
    description: undefined,
    startIcon: undefined,
    selected: true,
    'aria-pressed': true,
    indicator: 'check',
  },
};

export const IndependentAction: Story = {
  args: {
    children: 'Alex Morgan',
    startIcon: <IconUser />,
    description: 'Account owner',
  },
  render: (args) => (
    <div style={SIBLING_STYLE}>
      <ListItemButton {...args} />
      <Button size="sm" variant="ghost" aria-label="Open Alex Morgan's details">
        Details
      </Button>
    </div>
  ),
};
