import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Radio } from '@ui/primitives/input/Radio/Radio';
import { ComponentDecorator } from '@ui/testing';

import { RadioGroup } from '../RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Input/RadioGroup',
  component: RadioGroup,
  args: {
    'aria-label': 'Billing frequency',
    defaultValue: 'monthly',
    children: (
      <>
        <Radio value="monthly">Monthly</Radio>
        <Radio value="yearly">Yearly</Radio>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};
