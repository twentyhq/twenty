import { type Meta, type StoryObj } from '@storybook/react-vite';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { InputErrorHelper } from '@ui/input/InputErrorHelper/InputErrorHelper';

const meta: Meta<typeof InputErrorHelper> = {
  title: 'UI/Input/InputErrorHelper',
  component: InputErrorHelper,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof InputErrorHelper>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    children: 'This field is required',
  },
};
