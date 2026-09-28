import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconPlus, IconTrash } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import { ComponentDecorator } from '@ui/testing';

import { LightIconButton } from '../LightIconButton';

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/Input/Button/ButtonGroup',
  component: ButtonGroup,
  tags: ['!autodocs'],
};

export default meta;

type Story = StoryObj<typeof ButtonGroup>;

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
      buttons[1]!.getBoundingClientRect().left -
        buttons[0]!.getBoundingClientRect().right,
    ).toBe(2);
  },
};
export const FramedDocumentation: Story = {
  ...Framed,
  play: undefined,
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
