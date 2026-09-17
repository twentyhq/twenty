import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconPlus, IconTrash } from '@ui/icon';
import { LightIconButton } from '@ui/components/LightIconButton/LightIconButton';
import { ComponentDecorator } from '@ui/testing';
import { IconButtonGroup } from '../IconButtonGroup';

const meta: Meta<typeof IconButtonGroup> = {
  title: 'UI/Input/Button/IconButtonGroup',
  component: IconButtonGroup,
  decorators: [ComponentDecorator],
};
export default meta;
type Story = StoryObj<typeof IconButtonGroup>;

export const Default: Story = {
  render: () => (
    <IconButtonGroup aria-label="Record actions" className="nodrag nopan">
      <LightIconButton aria-label="Add" emphasis="subtle">
        <IconPlus />
      </LightIconButton>
      <LightIconButton
        aria-label="Delete"
        emphasis="subtle"
        disabled
        tooltip="Unavailable"
      >
        <IconTrash />
      </LightIconButton>
    </IconButtonGroup>
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
export const Dark: Story = { ...Default, globals: { colorScheme: 'dark' } };
export const Single: Story = {
  render: () => (
    <IconButtonGroup aria-label="Single action">
      <LightIconButton aria-label="Add">
        <IconPlus />
      </LightIconButton>
    </IconButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('group').getBoundingClientRect().width,
    ).toBe(26);
  },
};
export const DisabledAction: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <IconButtonGroup {...args}>
      <LightIconButton aria-label="Delete" disabled>
        <IconTrash />
      </LightIconButton>
    </IconButtonGroup>
  ),
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
