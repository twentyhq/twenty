import { type Meta, type StoryObj } from '@storybook/react-vite';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { InputLabel } from '@ui/input/InputLabel/InputLabel';

const meta: Meta<typeof InputLabel> = {
  title: 'UI/Input/InputLabel',
  component: InputLabel,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof InputLabel>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    children: 'Label',
  },
};
