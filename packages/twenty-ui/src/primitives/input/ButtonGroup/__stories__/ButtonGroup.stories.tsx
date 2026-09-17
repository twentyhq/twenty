import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  IconCheckbox,
  IconNotes,
  IconPlus,
  IconTimelineEvent,
  IconTrash,
} from '@ui/icon';
import { LightIconButton } from '@ui/components/LightIconButton/LightIconButton';
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

    const directButton = canvas.getByRole('button', { name: 'Direct action' });
    const fragmentButton = canvas.getByRole('button', {
      name: 'Fragment action',
    });
    const wrappedButton = canvas.getByRole('button', {
      name: 'Wrapped action',
    });
    const directButtonStyle = getComputedStyle(directButton);
    const fragmentButtonStyle = getComputedStyle(fragmentButton);
    const wrappedButtonStyle = getComputedStyle(wrappedButton);

    await expect(directButtonStyle.borderStartStartRadius).not.toBe('0px');
    await expect(directButtonStyle.borderStartEndRadius).toBe('0px');
    await expect(fragmentButtonStyle.borderStartStartRadius).toBe('0px');
    await expect(fragmentButtonStyle.borderStartEndRadius).toBe('0px');
    await expect(wrappedButtonStyle.borderStartStartRadius).toBe('0px');
    await expect(wrappedButtonStyle.borderEndStartRadius).toBe('0px');
    await expect(wrappedButtonStyle.borderStartEndRadius).toBe(
      directButtonStyle.borderStartStartRadius,
    );

    wrappedButton.focus();

    await expect(getComputedStyle(wrapper).zIndex).toBe('1');
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

export const Framed: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <ButtonGroup
      framed
      attached={false}
      aria-label="Record actions"
      className="nodrag nopan"
    >
      <LightIconButton size="xs" aria-label="Add" emphasis="subtle">
        <IconPlus />
      </LightIconButton>
      <LightIconButton
        size="xs"
        aria-label="Delete"
        emphasis="subtle"
        disabled
        tooltip="Unavailable"
      >
        <IconTrash />
      </LightIconButton>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Record actions' });
    const buttons = within(group).getAllByRole('button');
    await expect(group).toHaveClass('nodrag', 'nopan');
    await expect(group.getBoundingClientRect().height).toBe(26);
    await expect(group.getBoundingClientRect().width).toBe(48);
    for (const button of buttons) {
      await expect(button.getBoundingClientRect().width).toBe(20);
      await expect(button.getBoundingClientRect().height).toBe(20);
      await expect(getComputedStyle(button).borderTopLeftRadius).toBe(
        getComputedStyle(button).borderTopRightRadius,
      );
      await expect(
        parseFloat(getComputedStyle(button).borderTopLeftRadius),
      ).toBeGreaterThan(0);
    }
    await expect(
      buttons[1].getBoundingClientRect().left -
        buttons[0].getBoundingClientRect().right,
    ).toBe(2);
  },
};
export const FramedDark: Story = {
  ...Framed,
  globals: { colorScheme: 'dark' },
};
export const FramedSingle: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <ButtonGroup framed attached={false} aria-label="Single action">
      <LightIconButton size="xs" aria-label="Add">
        <IconPlus />
      </LightIconButton>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('group').getBoundingClientRect().width,
    ).toBe(26);
  },
};
export const FramedDisabledAction: Story = {
  decorators: [ComponentDecorator],
  args: { onClick: fn() },
  render: (args) => (
    <ButtonGroup framed attached={false} {...args}>
      <LightIconButton size="xs" aria-label="Delete" disabled>
        <IconTrash />
      </LightIconButton>
    </ButtonGroup>
  ),
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const FramedMixedButtons: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <ButtonGroup framed attached={false} aria-label="Mixed actions">
      <Button size="sm" variant="solid" color="accent">
        Save
      </Button>
      <LightIconButton size="xs" aria-label="Add">
        <IconPlus />
      </LightIconButton>
      <LightIconButton size="md" aria-label="Delete">
        <IconTrash />
      </LightIconButton>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Save' });
    const add = canvas.getByRole('button', { name: 'Add' });
    const remove = canvas.getByRole('button', { name: 'Delete' });

    await expect(save.getBoundingClientRect().height).toBe(24);
    await expect(save).toHaveAttribute('data-variant', 'solid');
    await expect(save).toHaveAttribute('data-color', 'accent');
    await expect(add.getBoundingClientRect().width).toBe(20);
    await expect(remove.getBoundingClientRect().width).toBe(32);
    await expect(add).toHaveAttribute('data-variant', 'ghost');
    await expect(canvas.getByRole('group').getBoundingClientRect().height).toBe(
      38,
    );
  },
};

export const FramedAttached: Story = {
  ...Default,
  args: { ...Default.args, framed: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    const firstButtonStyle = getComputedStyle(buttons[0]);
    const lastButtonStyle = getComputedStyle(buttons[2]);
    const groupStyle = getComputedStyle(canvas.getByRole('group'));

    await expect(firstButtonStyle.borderStartEndRadius).toBe('0px');
    await expect(lastButtonStyle.borderStartStartRadius).toBe('0px');
    await expect(firstButtonStyle.borderStartStartRadius).toBe(
      lastButtonStyle.borderStartEndRadius,
    );
    await expect(
      parseFloat(groupStyle.borderStartStartRadius) -
        parseFloat(firstButtonStyle.borderStartStartRadius),
    ).toBe(
      parseFloat(groupStyle.paddingInlineStart) +
        parseFloat(groupStyle.borderInlineStartWidth),
    );
  },
};
