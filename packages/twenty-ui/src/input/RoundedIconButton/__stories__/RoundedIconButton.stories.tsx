import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconArrowRight } from '@ui/icon';
import { ComponentDecorator } from '@ui/testing';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RoundedIconButton } from '@ui/input/RoundedIconButton/RoundedIconButton';

const clickJestFn = fn();

const meta: Meta<typeof RoundedIconButton> = {
  title: 'UI/Input/Button/RoundedIconButton',
  component: RoundedIconButton,
};

export default meta;
type Story = StoryObj<typeof RoundedIconButton>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  argTypes: { Icon: { control: false } },
  args: { onClick: clickJestFn, Icon: IconArrowRight, 'aria-label': 'Next' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
