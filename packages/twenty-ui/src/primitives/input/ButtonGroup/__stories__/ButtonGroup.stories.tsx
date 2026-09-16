import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/icon';
import { ComponentDecorator } from '@ui/testing';
import { Button } from '@ui/primitives/input/Button/Button';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';

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

const WrappedButton = () => <Button>Wrapped action</Button>;

export const InheritedAppearance: Story = {
  ...Default,
  args: {
    'aria-label': 'Shared appearance',
    variant: 'solid',
    color: 'accent',
    size: 'sm',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="ghost" color="danger" size="md">
        Direct action
      </Button>
      <>
        <Button>Fragment action</Button>
      </>
      <span title="Button wrapper">
        <WrappedButton />
      </span>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toHaveAttribute('data-variant', 'solid');
      await expect(button).toHaveAttribute('data-color', 'accent');
      await expect(button).toHaveAttribute('data-size', 'sm');
    }

    const wrapper = canvas.getByTitle('Button wrapper');

    await expect(wrapper).not.toHaveAttribute('variant');
    await expect(wrapper).not.toHaveAttribute('color');
    await expect(wrapper).not.toHaveAttribute('size');
  },
};

export const UnspecifiedAppearance: Story = {
  ...Default,
  render: () => (
    <ButtonGroup aria-label="Individual appearance">
      <Button variant="ghost" color="danger" size="sm">
        Explicit appearance
      </Button>
      <Button>Default appearance</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const explicitButton = canvas.getByRole('button', {
      name: 'Explicit appearance',
    });
    const defaultButton = canvas.getByRole('button', {
      name: 'Default appearance',
    });

    await expect(explicitButton).toHaveAttribute('data-variant', 'ghost');
    await expect(explicitButton).toHaveAttribute('data-color', 'danger');
    await expect(explicitButton).toHaveAttribute('data-size', 'sm');
    await expect(defaultButton).toHaveAttribute('data-variant', 'outline');
    await expect(defaultButton).toHaveAttribute('data-color', 'neutral');
    await expect(defaultButton).toHaveAttribute('data-size', 'md');
  },
};
