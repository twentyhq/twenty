import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { IconArrowRight } from '@ui/display';
import { ComponentDecorator } from '@ui/testing';
import { RoundedIconButton } from '../RoundedIconButton';

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
  args: { onClick: clickJestFn, Icon: IconArrowRight },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
