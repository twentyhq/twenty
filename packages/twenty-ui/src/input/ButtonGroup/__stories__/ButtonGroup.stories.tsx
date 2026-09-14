import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/icon';
import { ComponentDecorator } from '@ui/testing';
import { Button } from '@ui/input/Button/Button';
import { ButtonGroup } from '@ui/input/ButtonGroup/ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/Input/Button/ButtonGroup',
  component: ButtonGroup,
};
export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  args: {
    'aria-label': 'Create activity',
    size: 'sm',
    children: [
      <Button key="note" startIcon={<IconNotes />}>
        Note
      </Button>,
      <Button key="task" startIcon={<IconCheckbox />}>
        Task
      </Button>,
      <Button key="activity" startIcon={<IconTimelineEvent />}>
        Activity
      </Button>,
    ],
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    buttons[0].focus();
    await userEvent.tab();
    await expect(buttons[1]).toHaveFocus();
  },
};

export const Dark: Story = { ...Default, globals: { colorScheme: 'dark' } };
export const Single: Story = {
  ...Default,
  play: undefined,
  args: { children: <Button>Save</Button> },
};
